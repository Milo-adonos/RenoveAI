export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  stripe_customer_id: string | null;
  subscription_status: "inactive" | "active" | "canceled";
  subscription_plan: "monthly" | "yearly" | null;
  subscription_end_date: string | null;
  trial_end_date: string | null;
  generations_used: number;
  generations_reset_date: string | null;
  weekly_generations_used: number;
  weekly_reset_date: string | null;
  created_at: string;
}

export interface Generation {
  id: string;
  user_id: string;
  original_image_url: string;
  generated_image_url: string;
  style: string | null;
  custom_prompt: string | null;
  created_at: string;
}
