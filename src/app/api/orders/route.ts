import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createServiceClient();

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
        total: body.total,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Insert order items
    if (body.items?.length) {
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(
          body.items.map((item: any) => ({
            order_id: order.id,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            price: item.price,
          }))
        );
      if (itemsError) throw itemsError;
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
          total_spent: (existingCustomer.total_spent || 0) + body.total,
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
        total_spent: body.total,
      });
    }

    // Send WhatsApp notification
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2348000000000';
    const message = encodeURIComponent(
      `🆕 NEW ORDER!\n\n👤 ${body.customer_name}\n📞 ${body.customer_phone}\n📍 ${body.customer_address}, ${body.city}, ${body.state}\n\nItems:\n${
        body.items?.map((i: any) => `  • ${i.product_name} × ${i.quantity} = ₦${(i.price * i.quantity).toLocaleString()}`).join('\n') || ''
      }\n\n💰 Total: ₦${body.total.toLocaleString()}`
    );

    try {
      await fetch(`https://api.callmebot.com/whatsapp.php?phone=${whatsappNumber}&text=${message}&apikey=12345`);
    } catch {
      // WhatsApp notification is best-effort
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

