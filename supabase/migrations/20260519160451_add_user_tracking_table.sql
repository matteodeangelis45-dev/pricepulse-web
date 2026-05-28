/*
  # Add user_tracking table

  1. New Table
    - `user_tracking`
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK auth.users) - the user tracking the product
      - `product_id` (uuid, FK products) - the product being tracked
      - `target_price` (numeric, nullable) - user's desired price
      - `notify_price_drop` (boolean, default true) - alert on price drops
      - `notify_target` (boolean, default true) - alert when target reached
      - `notes` (text, nullable) - user notes
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - RLS enabled
    - Users can only access their own tracking entries
    - Unique constraint: one user can track a product only once
*/

CREATE TABLE IF NOT EXISTS user_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  target_price numeric(12,2),
  notify_price_drop boolean DEFAULT true,
  notify_target boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
);

ALTER TABLE user_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tracking"
  ON user_tracking FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tracking"
  ON user_tracking FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tracking"
  ON user_tracking FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tracking"
  ON user_tracking FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_tracking_user_id ON user_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tracking_product_id ON user_tracking(product_id);

-- Auto-update trigger
CREATE TRIGGER update_user_tracking_updated_at
  BEFORE UPDATE ON user_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
