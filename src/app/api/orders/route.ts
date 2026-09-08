import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { createOrderSchema } from '@/lib/utils/validators';

type ProductRow = {
  id: string;
  name: string;
  price: number | string;
  stock: number;
  availability: 'in_stock' | 'out_of_stock' | 'pre_order';
  is_active: boolean;
};

export async function POST(request: Request) {
  try {
    const parsed = createOrderSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid order' },
        { status: 400 }
      );
    }

    const body = parsed.data;
    const supabase = createServiceClient();

    const productIds = [...new Set(body.items.map(item => item.product_id))];
    const { data: productData, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, stock, availability, is_active')
      .in('id', productIds);

    if (productsError) throw productsError;
    const products = (productData || []) as ProductRow[];
    const productById = new Map(products.map(product => [product.id, product]));

    const items = body.items.map(item => {
      const product = productById.get(item.product_id);
      if (!product || !product.is_active) {
        throw new Error('One or more products are no longer available');
      }
      if (product.availability === 'out_of_stock' || product.stock < item.quantity) {
        throw new Error(`${product.name} does not have enough stock`);
      }
      return {
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        price: Number(product.price),
      };
    });
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        customer_name: body.customer_name,
        customer_phone: body.customer_phone,
        customer_email: body.customer_email,
        customer_address: body.customer_address,
        state: body.state,
        city: body.city,
        notes: body.notes || '',
        total,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Insert order items
    if (items.length) {
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(items.map(item => ({ order_id: order.id, ...item })));
      if (itemsError) {
        await supabase.from('orders').delete().eq('id', order.id);
        throw itemsError;
      }
    }

    // Update or create customer
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id, total_orders, total_spent')
      .eq('email', body.customer_email)
      .single();

    if (existingCustomer) {
      await supabase
        .from('customers')
        .update({
          total_orders: (existingCustomer.total_orders || 0) + 1,
          total_spent: Number(existingCustomer.total_spent || 0) + total,
          phone: body.customer_phone,
          address: body.customer_address,
          state: body.state,
          city: body.city,
        })
        .eq('id', existingCustomer.id);
    } else {
      await supabase.from('customers').insert({
        name: body.customer_name,
        email: body.customer_email,
        phone: body.customer_phone,
        address: body.customer_address,
        state: body.state,
        city: body.city,
        total_orders: 1,
        total_spent: total,
      });
    }

    // Send WhatsApp notification
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2348000000000';
    const message = encodeURIComponent(
      `🆕 NEW ORDER!\n\n👤 ${body.customer_name}\n📞 ${body.customer_phone}\n📍 ${body.customer_address}, ${body.city}, ${body.state}\n\nItems:\n${
        items.map(i => `  • ${i.product_name} × ${i.quantity} = ₦${(i.price * i.quantity).toLocaleString()}`).join('\n')
      }\n\n💰 Total: ₦${total.toLocaleString()}`
    );

    try {
      await fetch(`https://api.callmebot.com/whatsapp.php?phone=${whatsappNumber}&text=${message}&apikey=12345`);
    } catch {
      // WhatsApp notification is best-effort
    }

    return NextResponse.json({ success: true, order });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create order';
    const isAvailabilityError = message.includes('available') || message.includes('stock');
    return NextResponse.json({ error: message }, { status: isAvailabilityError ? 409 : 500 });
  }
}
