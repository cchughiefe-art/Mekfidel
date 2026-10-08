export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      ai_change_requests: {
        Row: {
          actions: Json;
          applied_at: string | null;
          created_at: string;
          created_by: string;
          error: string | null;
          id: string;
          instruction: string;
          rollback_actions: Json;
          rolled_back_at: string | null;
          status: string;
          summary: string;
        };
        Insert: {
          actions?: Json;
          applied_at?: string | null;
          created_at?: string;
          created_by: string;
          error?: string | null;
          id?: string;
          instruction: string;
          rollback_actions?: Json;
          rolled_back_at?: string | null;
          status?: string;
          summary: string;
        };
        Update: {
          actions?: Json;
          applied_at?: string | null;
          created_at?: string;
          created_by?: string;
          error?: string | null;
          id?: string;
          instruction?: string;
          rollback_actions?: Json;
          rolled_back_at?: string | null;
          status?: string;
          summary?: string;
        };
        Relationships: [];
      };
      blog_posts: {
        Row: {
          author: string | null;
          category: string | null;
          content: string;
          created_at: string | null;
          excerpt: string;
          id: string;
          image: string | null;
          is_published: boolean | null;
          published_at: string | null;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          tags: string[] | null;
          title: string;
          updated_at: string | null;
          views: number | null;
        };
        Insert: {
          author?: string | null;
          category?: string | null;
          content: string;
          created_at?: string | null;
          excerpt: string;
          id?: string;
          image?: string | null;
          is_published?: boolean | null;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug: string;
          tags?: string[] | null;
          title: string;
          updated_at?: string | null;
          views?: number | null;
        };
        Update: {
          author?: string | null;
          category?: string | null;
          content?: string;
          created_at?: string | null;
          excerpt?: string;
          id?: string;
          image?: string | null;
          is_published?: boolean | null;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string;
          tags?: string[] | null;
          title?: string;
          updated_at?: string | null;
          views?: number | null;
        };
        Relationships: [];
      };
      brands: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          is_active: boolean | null;
          logo: string | null;
          name: string;
          slug: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_active?: boolean | null;
          logo?: string | null;
          name: string;
          slug: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_active?: boolean | null;
          logo?: string | null;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          image: string | null;
          is_active: boolean | null;
          name: string;
          order: number | null;
          parent_id: string | null;
          slug: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          image?: string | null;
          is_active?: boolean | null;
          name: string;
          order?: number | null;
          parent_id?: string | null;
          slug: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          image?: string | null;
          is_active?: boolean | null;
          name?: string;
          order?: number | null;
          parent_id?: string | null;
          slug?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      company_info: {
        Row: {
          content: string;
          created_at: string | null;
          icon_library: string | null;
          icon_name: string | null;
          id: string;
          image: string | null;
          info_key: string;
          info_type: string | null;
          is_active: boolean | null;
          sort_order: number | null;
          title: string | null;
          updated_at: string | null;
        };
        Insert: {
          content: string;
          created_at?: string | null;
          icon_library?: string | null;
          icon_name?: string | null;
          id?: string;
          image?: string | null;
          info_key: string;
          info_type?: string | null;
          is_active?: boolean | null;
          sort_order?: number | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Update: {
          content?: string;
          created_at?: string | null;
          icon_library?: string | null;
          icon_name?: string | null;
          id?: string;
          image?: string | null;
          info_key?: string;
          info_type?: string | null;
          is_active?: boolean | null;
          sort_order?: number | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      content_blocks: {
        Row: {
          block_key: string;
          block_type: string | null;
          content: string;
          created_at: string | null;
          id: string;
          is_active: boolean | null;
          page: string | null;
          position: string | null;
          sort_order: number | null;
          title: string | null;
          updated_at: string | null;
        };
        Insert: {
          block_key: string;
          block_type?: string | null;
          content: string;
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          page?: string | null;
          position?: string | null;
          sort_order?: number | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Update: {
          block_key?: string;
          block_type?: string | null;
          content?: string;
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          page?: string | null;
          position?: string | null;
          sort_order?: number | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          address: string | null;
          city: string | null;
          created_at: string | null;
          email: string;
          id: string;
          name: string;
          phone: string;
          state: string | null;
          total_orders: number | null;
          total_spent: number | null;
        };
        Insert: {
          address?: string | null;
          city?: string | null;
          created_at?: string | null;
          email: string;
          id?: string;
          name: string;
          phone: string;
          state?: string | null;
          total_orders?: number | null;
          total_spent?: number | null;
        };
        Update: {
          address?: string | null;
          city?: string | null;
          created_at?: string | null;
          email?: string;
          id?: string;
          name?: string;
          phone?: string;
          state?: string | null;
          total_orders?: number | null;
          total_spent?: number | null;
        };
        Relationships: [];
      };
      faqs: {
        Row: {
          answer: string;
          category: string | null;
          created_at: string | null;
          id: string;
          is_published: boolean | null;
          order: number | null;
          question: string;
          sort_order: number | null;
          updated_at: string | null;
        };
        Insert: {
          answer: string;
          category?: string | null;
          created_at?: string | null;
          id?: string;
          is_published?: boolean | null;
          order?: number | null;
          question: string;
          sort_order?: number | null;
          updated_at?: string | null;
        };
        Update: {
          answer?: string;
          category?: string | null;
          created_at?: string | null;
          id?: string;
          is_published?: boolean | null;
          order?: number | null;
          question?: string;
          sort_order?: number | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      feature_cards: {
        Row: {
          created_at: string | null;
          description: string | null;
          icon_color: string | null;
          icon_library: string | null;
          icon_name: string | null;
          id: string;
          is_active: boolean | null;
          section_id: string | null;
          sort_order: number | null;
          title: string;
          updated_at: string | null;
          url: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          icon_color?: string | null;
          icon_library?: string | null;
          icon_name?: string | null;
          id?: string;
          is_active?: boolean | null;
          section_id?: string | null;
          sort_order?: number | null;
          title: string;
          updated_at?: string | null;
          url?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          icon_color?: string | null;
          icon_library?: string | null;
          icon_name?: string | null;
          id?: string;
          is_active?: boolean | null;
          section_id?: string | null;
          sort_order?: number | null;
          title?: string;
          updated_at?: string | null;
          url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "feature_cards_section_id_fkey";
            columns: ["section_id"];
            isOneToOne: false;
            referencedRelation: "homepage_sections";
            referencedColumns: ["id"];
          },
        ];
      };
      footer_sections: {
        Row: {
          content: string | null;
          created_at: string | null;
          icon_library: string | null;
          icon_name: string | null;
          id: string;
          is_active: boolean | null;
          links: Json | null;
          section_key: string;
          sort_order: number | null;
          title: string | null;
          updated_at: string | null;
        };
        Insert: {
          content?: string | null;
          created_at?: string | null;
          icon_library?: string | null;
          icon_name?: string | null;
          id?: string;
          is_active?: boolean | null;
          links?: Json | null;
          section_key: string;
          sort_order?: number | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Update: {
          content?: string | null;
          created_at?: string | null;
          icon_library?: string | null;
          icon_name?: string | null;
          id?: string;
          is_active?: boolean | null;
          links?: Json | null;
          section_key?: string;
          sort_order?: number | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      homepage_sections: {
        Row: {
          background_color: string | null;
          background_image: string | null;
          button_text: string | null;
          button_url: string | null;
          color: string | null;
          created_at: string | null;
          description: string | null;
          icon: string | null;
          id: string;
          image: string | null;
          is_active: boolean | null;
          metadata: Json | null;
          section_key: string;
          section_type: string;
          sort_order: number | null;
          subtitle: string | null;
          title: string | null;
          updated_at: string | null;
        };
        Insert: {
          background_color?: string | null;
          background_image?: string | null;
          button_text?: string | null;
          button_url?: string | null;
          color?: string | null;
          created_at?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          image?: string | null;
          is_active?: boolean | null;
          metadata?: Json | null;
          section_key: string;
          section_type: string;
          sort_order?: number | null;
          subtitle?: string | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Update: {
          background_color?: string | null;
          background_image?: string | null;
          button_text?: string | null;
          button_url?: string | null;
          color?: string | null;
          created_at?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          image?: string | null;
          is_active?: boolean | null;
          metadata?: Json | null;
          section_key?: string;
          section_type?: string;
          sort_order?: number | null;
          subtitle?: string | null;
          title?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      media: {
        Row: {
          alt: string | null;
          created_at: string | null;
          folder: string | null;
          height: number | null;
          id: string;
          name: string;
          size: number | null;
          type: string | null;
          url: string;
          width: number | null;
        };
        Insert: {
          alt?: string | null;
          created_at?: string | null;
          folder?: string | null;
          height?: number | null;
          id?: string;
          name: string;
          size?: number | null;
          type?: string | null;
          url: string;
          width?: number | null;
        };
        Update: {
          alt?: string | null;
          created_at?: string | null;
          folder?: string | null;
          height?: number | null;
          id?: string;
          name?: string;
          size?: number | null;
          type?: string | null;
          url?: string;
          width?: number | null;
        };
        Relationships: [];
      };
      navigation_items: {
        Row: {
          created_at: string | null;
          icon_library: string | null;
          icon_name: string | null;
          id: string;
          is_active: boolean | null;
          is_new_tab: boolean | null;
          label: string;
          location: string;
          parent_id: string | null;
          sort_order: number | null;
          updated_at: string | null;
          url: string;
        };
        Insert: {
          created_at?: string | null;
          icon_library?: string | null;
          icon_name?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_new_tab?: boolean | null;
          label: string;
          location: string;
          parent_id?: string | null;
          sort_order?: number | null;
          updated_at?: string | null;
          url: string;
        };
        Update: {
          created_at?: string | null;
          icon_library?: string | null;
          icon_name?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_new_tab?: boolean | null;
          label?: string;
          location?: string;
          parent_id?: string | null;
          sort_order?: number | null;
          updated_at?: string | null;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "navigation_items_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "navigation_items";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string | null;
          price: number;
          product_id: string | null;
          product_name: string;
          quantity: number;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          price: number;
          product_id?: string | null;
          product_name: string;
          quantity?: number;
        };
        Update: {
          id?: string;
          order_id?: string | null;
          price?: number;
          product_id?: string | null;
          product_name?: string;
          quantity?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          city: string;
          created_at: string | null;
          customer_address: string;
          customer_email: string;
          customer_name: string;
          customer_phone: string;
          id: string;
          notes: string | null;
          state: string;
          status: string | null;
          total: number;
        };
        Insert: {
          city: string;
          created_at?: string | null;
          customer_address: string;
          customer_email: string;
          customer_name: string;
          customer_phone: string;
          id?: string;
          notes?: string | null;
          state: string;
          status?: string | null;
          total?: number;
        };
        Update: {
          city?: string;
          created_at?: string | null;
          customer_address?: string;
          customer_email?: string;
          customer_name?: string;
          customer_phone?: string;
          id?: string;
          notes?: string | null;
          state?: string;
          status?: string | null;
          total?: number;
        };
        Relationships: [];
      };
      products: {
        Row: {
          availability: string | null;
          brand_id: string | null;
          category_id: string | null;
          compare_price: number | null;
          created_at: string | null;
          description: string | null;
          features: string[] | null;
          id: string;
          images: string[] | null;
          is_active: boolean | null;
          is_featured: boolean | null;
          name: string;
          price: number;
          seo_description: string | null;
          seo_title: string | null;
          sku: string;
          slug: string;
          specifications: Json | null;
          stock: number;
          updated_at: string | null;
          views: number | null;
          warranty: string | null;
        };
        Insert: {
          availability?: string | null;
          brand_id?: string | null;
          category_id?: string | null;
          compare_price?: number | null;
          created_at?: string | null;
          description?: string | null;
          features?: string[] | null;
          id?: string;
          images?: string[] | null;
          is_active?: boolean | null;
          is_featured?: boolean | null;
          name: string;
          price?: number;
          seo_description?: string | null;
          seo_title?: string | null;
          sku: string;
          slug: string;
          specifications?: Json | null;
          stock?: number;
          updated_at?: string | null;
          views?: number | null;
          warranty?: string | null;
        };
        Update: {
          availability?: string | null;
          brand_id?: string | null;
          category_id?: string | null;
          compare_price?: number | null;
          created_at?: string | null;
          description?: string | null;
          features?: string[] | null;
          id?: string;
          images?: string[] | null;
          is_active?: boolean | null;
          is_featured?: boolean | null;
          name?: string;
          price?: number;
          seo_description?: string | null;
          seo_title?: string | null;
          sku?: string;
          slug?: string;
          specifications?: Json | null;
          stock?: number;
          updated_at?: string | null;
          views?: number | null;
          warranty?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey";
            columns: ["brand_id"];
            isOneToOne: false;
            referencedRelation: "brands";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          email: string | null;
          full_name: string | null;
          id: string;
          role: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          id: string;
          role?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          role?: string | null;
        };
        Relationships: [];
      };
      screen_compatibility: {
        Row: {
          brand: string;
          compatible_with: string[] | null;
          created_at: string | null;
          id: string;
          is_active: boolean | null;
          manufacturer_model: string | null;
          model: string;
          notes: string | null;
          screen_code: string | null;
          series: string | null;
        };
        Insert: {
          brand: string;
          compatible_with?: string[] | null;
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          manufacturer_model?: string | null;
          model: string;
          notes?: string | null;
          screen_code?: string | null;
          series?: string | null;
        };
        Update: {
          brand?: string;
          compatible_with?: string[] | null;
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          manufacturer_model?: string | null;
          model?: string;
          notes?: string | null;
          screen_code?: string | null;
          series?: string | null;
        };
        Relationships: [];
      };
      services: {
        Row: {
          color: string | null;
          created_at: string | null;
          description: string;
          features: string[] | null;
          icon: string;
          id: string;
          is_active: boolean | null;
          order_index: number | null;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          color?: string | null;
          created_at?: string | null;
          description: string;
          features?: string[] | null;
          icon: string;
          id?: string;
          is_active?: boolean | null;
          order_index?: number | null;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          color?: string | null;
          created_at?: string | null;
          description?: string;
          features?: string[] | null;
          icon?: string;
          id?: string;
          is_active?: boolean | null;
          order_index?: number | null;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      settings: {
        Row: {
          about_text: string | null;
          address: string | null;
          business_hours: string | null;
          company_name: string | null;
          email: string | null;
          footer_text: string | null;
          google_maps_embed: string | null;
          hero_banner: string | null;
          homepage_hero_subtitle: string | null;
          homepage_hero_title: string | null;
          id: string;
          logo: string | null;
          phone: string | null;
          seo_description: string | null;
          seo_keywords: string | null;
          seo_title: string | null;
          social_media: Json | null;
          updated_at: string | null;
          whatsapp: string | null;
        };
        Insert: {
          about_text?: string | null;
          address?: string | null;
          business_hours?: string | null;
          company_name?: string | null;
          email?: string | null;
          footer_text?: string | null;
          google_maps_embed?: string | null;
          hero_banner?: string | null;
          homepage_hero_subtitle?: string | null;
          homepage_hero_title?: string | null;
          id?: string;
          logo?: string | null;
          phone?: string | null;
          seo_description?: string | null;
          seo_keywords?: string | null;
          seo_title?: string | null;
          social_media?: Json | null;
          updated_at?: string | null;
          whatsapp?: string | null;
        };
        Update: {
          about_text?: string | null;
          address?: string | null;
          business_hours?: string | null;
          company_name?: string | null;
          email?: string | null;
          footer_text?: string | null;
          google_maps_embed?: string | null;
          hero_banner?: string | null;
          homepage_hero_subtitle?: string | null;
          homepage_hero_title?: string | null;
          id?: string;
          logo?: string | null;
          phone?: string | null;
          seo_description?: string | null;
          seo_keywords?: string | null;
          seo_title?: string | null;
          social_media?: Json | null;
          updated_at?: string | null;
          whatsapp?: string | null;
        };
        Relationships: [];
      };
      social_links: {
        Row: {
          created_at: string | null;
          icon_library: string | null;
          icon_name: string | null;
          id: string;
          is_visible: boolean | null;
          label: string;
          platform: string;
          sort_order: number | null;
          updated_at: string | null;
          url: string | null;
        };
        Insert: {
          created_at?: string | null;
          icon_library?: string | null;
          icon_name?: string | null;
          id?: string;
          is_visible?: boolean | null;
          label: string;
          platform: string;
          sort_order?: number | null;
          updated_at?: string | null;
          url?: string | null;
        };
        Update: {
          created_at?: string | null;
          icon_library?: string | null;
          icon_name?: string | null;
          id?: string;
          is_visible?: boolean | null;
          label?: string;
          platform?: string;
          sort_order?: number | null;
          updated_at?: string | null;
          url?: string | null;
        };
        Relationships: [];
      };
      statistics: {
        Row: {
          context: string | null;
          created_at: string | null;
          icon_library: string | null;
          icon_name: string | null;
          id: string;
          is_active: boolean | null;
          label: string;
          sort_order: number | null;
          suffix: string | null;
          updated_at: string | null;
          value: string;
        };
        Insert: {
          context?: string | null;
          created_at?: string | null;
          icon_library?: string | null;
          icon_name?: string | null;
          id?: string;
          is_active?: boolean | null;
          label: string;
          sort_order?: number | null;
          suffix?: string | null;
          updated_at?: string | null;
          value: string;
        };
        Update: {
          context?: string | null;
          created_at?: string | null;
          icon_library?: string | null;
          icon_name?: string | null;
          id?: string;
          is_active?: boolean | null;
          label?: string;
          sort_order?: number | null;
          suffix?: string | null;
          updated_at?: string | null;
          value?: string;
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
          avatar: string | null;
          company: string | null;
          content: string;
          created_at: string | null;
          id: string;
          image: string | null;
          is_featured: boolean | null;
          is_published: boolean | null;
          name: string;
          rating: number | null;
          role: string | null;
          sort_order: number | null;
          updated_at: string | null;
        };
        Insert: {
          avatar?: string | null;
          company?: string | null;
          content: string;
          created_at?: string | null;
          id?: string;
          image?: string | null;
          is_featured?: boolean | null;
          is_published?: boolean | null;
          name: string;
          rating?: number | null;
          role?: string | null;
          sort_order?: number | null;
          updated_at?: string | null;
        };
        Update: {
          avatar?: string | null;
          company?: string | null;
          content?: string;
          created_at?: string | null;
          id?: string;
          image?: string | null;
          is_featured?: boolean | null;
          is_published?: boolean | null;
          name?: string;
          rating?: number | null;
          role?: string | null;
          sort_order?: number | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      uploaded_icons: {
        Row: {
          created_at: string | null;
          height: number | null;
          id: string;
          name: string;
          slug: string;
          svg_content: string;
          tags: string[] | null;
          usage_count: number | null;
          width: number | null;
        };
        Insert: {
          created_at?: string | null;
          height?: number | null;
          id?: string;
          name: string;
          slug: string;
          svg_content: string;
          tags?: string[] | null;
          usage_count?: number | null;
          width?: number | null;
        };
        Update: {
          created_at?: string | null;
          height?: number | null;
          id?: string;
          name?: string;
          slug?: string;
          svg_content?: string;
          tags?: string[] | null;
          usage_count?: number | null;
          width?: number | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_cms_admin: { Args: never; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;

export type DatabaseRow<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
