export interface AdminStats {
  totalGenerations: number;
  totalUsers: number;
  activeSubscribers: number;
  inactiveSubscribers: number;
  canceledSubscribers: number;
  weeklySubscribers: number;
  monthlySubscribers: number;
  actualRevenue: number;
  actualRevenue30d: number;
  estimatedMRR: number;
  estimatedAICost: number;
  actualProfit: number;
  estimatedProfit: number;
  actualMarginPercent: number;
  estimatedMarginPercent: number;
  newUsers30d: number;
  canceledLast30d: number;
  churnRate30d: number;
  dailyGenerations: { date: string; count: number }[];
  dailyRevenue: { date: string; amount: number }[];
  lastUpdated: string;
}

export interface AdminUser {
  id: string;
  email: string | null;
  full_name: string | null;
  subscription_status: string | null;
  subscription_plan: string | null;
  subscription_end_date: string | null;
  created_at: string | null;
  generationsCount: number;
  aiCost: number;
  revenue: number;
  net: number;
}

export interface AdminGeneration {
  id: string;
  user_id: string;
  email: string | null;
  generated_image_url: string;
  style: string | null;
  custom_prompt: string | null;
  created_at: string;
  aiCost: number;
}
