export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          details: Json | null;
          entity_id: string | null;
          entity_type: string | null;
          id: string;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          details?: Json | null;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          created_at?: string;
          details?: Json | null;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
        };
        Relationships: [];
      };
      cart_items: {
        Row: {
          created_at: string;
          id: string;
          product_id: string;
          quantity: number;
          selected_unit: string;
          unit_price: number | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          product_id: string;
          quantity?: number;
          selected_unit?: string;
          unit_price?: number | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          product_id?: string;
          quantity?: number;
          selected_unit?: string;
          unit_price?: number | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      fcm_push_tokens: {
        Row: {
          created_at: string;
          id: string;
          last_seen_at: string;
          token: string;
          updated_at: string;
          user_agent: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          last_seen_at?: string;
          token: string;
          updated_at?: string;
          user_agent?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          last_seen_at?: string;
          token?: string;
          updated_at?: string;
          user_agent?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          created_at: string;
          description: string | null;
          emoji: string | null;
          icon: string | null;
          id: string;
          image_url: string | null;
          is_enabled: boolean;
          key: string;
          label: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          emoji?: string | null;
          icon?: string | null;
          id?: string;
          image_url?: string | null;
          is_enabled?: boolean;
          key: string;
          label: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          emoji?: string | null;
          icon?: string | null;
          id?: string;
          image_url?: string | null;
          is_enabled?: boolean;
          key?: string;
          label?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          body: string | null;
          created_at: string;
          id: string;
          is_read: boolean;
          title: string;
          type: string;
          user_id: string | null;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          title: string;
          type?: string;
          user_id?: string | null;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          title?: string;
          type?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          name: string;
          order_id: string;
          product_id: string | null;
          quantity: number;
          unit_price: number;
        };
        Insert: {
          id?: string;
          name: string;
          order_id: string;
          product_id?: string | null;
          quantity: number;
          unit_price: number;
        };
        Update: {
          id?: string;
          name?: string;
          order_id?: string;
          product_id?: string | null;
          quantity?: number;
          unit_price?: number;
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
          accepted_at: string | null;
          address: string;
          cancellation_reason: string | null;
          cancelled_at: string | null;
          cancelled_by: string | null;
          created_at: string;
          customer_id: string;
          delivered_at: string | null;
          delivery_fee: number;
          delivery_latitude: number | null;
          delivery_location_accuracy: number | null;
          delivery_longitude: number | null;
          delivery_partner_id: string | null;
          discount_total: number;
          id: string;
          idempotency_key: string | null;
          out_for_delivery_at: string | null;
          payment_method: string;
          payment_reference: string | null;
          payment_status: string;
          prepared_at: string | null;
          status: string;
          store_id: string | null;
          store_name: string;
          subtotal: number | null;
          tracking_code: string | null;
          total: number;
        };
        Insert: {
          accepted_at?: string | null;
          address: string;
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          created_at?: string;
          customer_id: string;
          delivered_at?: string | null;
          delivery_fee?: number;
          delivery_latitude?: number | null;
          delivery_location_accuracy?: number | null;
          delivery_longitude?: number | null;
          delivery_partner_id?: string | null;
          discount_total?: number;
          id?: string;
          idempotency_key?: string | null;
          out_for_delivery_at?: string | null;
          payment_method?: string;
          payment_reference?: string | null;
          payment_status?: string;
          prepared_at?: string | null;
          status?: string;
          store_id?: string | null;
          store_name: string;
          subtotal?: number | null;
          tracking_code?: string | null;
          total: number;
        };
        Update: {
          accepted_at?: string | null;
          address?: string;
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          created_at?: string;
          customer_id?: string;
          delivered_at?: string | null;
          delivery_fee?: number;
          delivery_latitude?: number | null;
          delivery_location_accuracy?: number | null;
          delivery_longitude?: number | null;
          delivery_partner_id?: string | null;
          discount_total?: number;
          id?: string;
          idempotency_key?: string | null;
          out_for_delivery_at?: string | null;
          payment_method?: string;
          payment_reference?: string | null;
          payment_status?: string;
          prepared_at?: string | null;
          status?: string;
          store_id?: string | null;
          store_name?: string;
          subtotal?: number | null;
          tracking_code?: string | null;
          total?: number;
        };
        Relationships: [
          {
            foreignKeyName: "orders_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
      otp_codes: {
        Row: {
          attempts: number;
          code_hash: string;
          consumed_at: string | null;
          created_at: string;
          expires_at: string;
          id: string;
          phone: string;
        };
        Insert: {
          attempts?: number;
          code_hash: string;
          consumed_at?: string | null;
          created_at?: string;
          expires_at: string;
          id?: string;
          phone: string;
        };
        Update: {
          attempts?: number;
          code_hash?: string;
          consumed_at?: string | null;
          created_at?: string;
          expires_at?: string;
          id?: string;
          phone?: string;
        };
        Relationships: [];
      };
      price_history: {
        Row: {
          changed_by: string | null;
          created_at: string;
          id: string;
          new_price: number;
          old_price: number | null;
          product_id: string;
          reason: string | null;
        };
        Insert: {
          changed_by?: string | null;
          created_at?: string;
          id?: string;
          new_price: number;
          old_price?: number | null;
          product_id: string;
          reason?: string | null;
        };
        Update: {
          changed_by?: string | null;
          created_at?: string;
          id?: string;
          new_price?: number;
          old_price?: number | null;
          product_id?: string;
          reason?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "price_history_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          category: string | null;
          created_at: string;
          deleted_at: string | null;
          deleted_previous_available: boolean | null;
          deleted_previous_status: string | null;
          deletion_batch_id: string | null;
          description: string | null;
          discount_price: number | null;
          featured: boolean;
          has_unit_options: boolean;
          id: string;
          image_url: string | null;
          is_available: boolean;
          is_popular: boolean;
          name: string;
          price: number;
          popular_sort_order: number;
          price_updated_at: string;
          sku: string | null;
          status: string;
          stock_quantity: number;
          store_id: string;
          subcategory_id: string | null;
          tags: string[];
          unit: string;
          unit_options: Json;
          updated_at: string;
          weight: number | null;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          deleted_previous_available?: boolean | null;
          deleted_previous_status?: string | null;
          deletion_batch_id?: string | null;
          description?: string | null;
          discount_price?: number | null;
          featured?: boolean;
          has_unit_options?: boolean;
          id?: string;
          image_url?: string | null;
          is_available?: boolean;
          is_popular?: boolean;
          name: string;
          price: number;
          popular_sort_order?: number;
          price_updated_at?: string;
          sku?: string | null;
          status?: string;
          stock_quantity?: number;
          store_id: string;
          subcategory_id?: string | null;
          tags?: string[];
          unit?: string;
          unit_options?: Json;
          updated_at?: string;
          weight?: number | null;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          deleted_previous_available?: boolean | null;
          deleted_previous_status?: string | null;
          deletion_batch_id?: string | null;
          description?: string | null;
          discount_price?: number | null;
          featured?: boolean;
          has_unit_options?: boolean;
          id?: string;
          image_url?: string | null;
          is_available?: boolean;
          is_popular?: boolean;
          name?: string;
          price?: number;
          popular_sort_order?: number;
          price_updated_at?: string;
          sku?: string | null;
          status?: string;
          stock_quantity?: number;
          store_id?: string;
          subcategory_id?: string | null;
          tags?: string[];
          unit?: string;
          unit_options?: Json;
          updated_at?: string;
          weight?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "products_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          address: string | null;
          avatar_url: string | null;
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          is_blocked: boolean;
          is_verified: boolean;
          last_login_at: string | null;
          phone: string | null;
          provider: string;
        };
        Insert: {
          address?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          is_blocked?: boolean;
          is_verified?: boolean;
          last_login_at?: string | null;
          phone?: string | null;
          provider?: string;
        };
        Update: {
          address?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          is_blocked?: boolean;
          is_verified?: boolean;
          last_login_at?: string | null;
          phone?: string | null;
          provider?: string;
        };
        Relationships: [];
      };
      stores: {
        Row: {
          address: string | null;
          approved_at: string | null;
          banner_url: string | null;
          category: string;
          created_at: string;
          delivery_available: boolean;
          delivery_fee: number;
          delivery_minutes: number;
          delivery_radius_km: number;
          description: string | null;
          id: string;
          is_active: boolean;
          latitude: number | null;
          logo_url: string | null;
          longitude: number | null;
          min_order: number;
          name: string;
          opening_hours: string | null;
          owner_id: string | null;
          owner_email: string | null;
          owner_name: string | null;
          owner_phone: string | null;
          phone: string | null;
          rating: number;
          sort_order: number;
          status: string;
          suspended_at: string | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          approved_at?: string | null;
          banner_url?: string | null;
          category: string;
          created_at?: string;
          delivery_available?: boolean;
          delivery_fee?: number;
          delivery_minutes?: number;
          delivery_radius_km?: number;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          latitude?: number | null;
          logo_url?: string | null;
          longitude?: number | null;
          min_order?: number;
          name: string;
          opening_hours?: string | null;
          owner_id?: string | null;
          owner_email?: string | null;
          owner_name?: string | null;
          owner_phone?: string | null;
          phone?: string | null;
          rating?: number;
          sort_order?: number;
          status?: string;
          suspended_at?: string | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          approved_at?: string | null;
          banner_url?: string | null;
          category?: string;
          created_at?: string;
          delivery_available?: boolean;
          delivery_fee?: number;
          delivery_minutes?: number;
          delivery_radius_km?: number;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          latitude?: number | null;
          logo_url?: string | null;
          longitude?: number | null;
          min_order?: number;
          name?: string;
          opening_hours?: string | null;
          owner_id?: string | null;
          owner_email?: string | null;
          owner_name?: string | null;
          owner_phone?: string | null;
          phone?: string | null;
          rating?: number;
          sort_order?: number;
          status?: string;
          suspended_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_admin: { Args: { _uid: string }; Returns: boolean };
    };
    Enums: {
      app_role:
        | "customer"
        | "seller"
        | "rider"
        | "admin"
        | "super_admin"
        | "store_manager"
        | "vendor"
        | "delivery_partner";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "customer",
        "seller",
        "rider",
        "admin",
        "super_admin",
        "store_manager",
        "vendor",
        "delivery_partner",
      ],
    },
  },
} as const;
