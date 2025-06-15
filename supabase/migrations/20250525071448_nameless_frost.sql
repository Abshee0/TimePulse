/*
  # Fix date timezone handling

  1. Changes
    - Add trigger to handle date conversion for attendance_records table
    - Ensure dates are stored without timezone adjustment
*/

-- Create a function to handle date conversion
CREATE OR REPLACE FUNCTION handle_date_conversion()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure the date is interpreted in UTC
    NEW.date = NEW.date::date;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for attendance_records
DROP TRIGGER IF EXISTS handle_date_conversion_trigger ON attendance_records;
CREATE TRIGGER handle_date_conversion_trigger
    BEFORE INSERT OR UPDATE ON attendance_records
    FOR EACH ROW
    EXECUTE FUNCTION handle_date_conversion();