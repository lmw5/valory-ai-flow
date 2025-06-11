
-- Create user_investments table to store user investment plans
CREATE TABLE public.user_investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  investment_amount NUMERIC NOT NULL,
  daily_return NUMERIC NOT NULL,
  validity_days INTEGER NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own investments
ALTER TABLE public.user_investments ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own investments
CREATE POLICY "Users can view their own investments" 
  ON public.user_investments 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own investments
CREATE POLICY "Users can create their own investments" 
  ON public.user_investments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own investments
CREATE POLICY "Users can update their own investments" 
  ON public.user_investments 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own investments
CREATE POLICY "Users can delete their own investments" 
  ON public.user_investments 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add trigger to automatically update the updated_at column
CREATE TRIGGER update_user_investments_updated_at
  BEFORE UPDATE ON public.user_investments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
