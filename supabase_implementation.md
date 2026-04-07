# Supabase Implementation Plan: Personal Travel Planner

This document defines the database schema, storage configuration, and server-side logic required for the Personal Travel Planner, as specified in `spec.md`.

## 1. Database Schema (PostgreSQL)

### Tables Definition

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Trips Table
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    people_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- 2. Trip Details (1:1 with Trips)
CREATE TABLE IF NOT EXISTS public.trip_details (
    trip_id UUID PRIMARY KEY REFERENCES public.trips(id) ON DELETE CASCADE,
    accommodation_snippet TEXT DEFAULT '',
    transport_snippet TEXT DEFAULT '',
    accommodation_file_url TEXT,
    transport_file_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Daily Activities (1:N with Trips)
CREATE TABLE IF NOT EXISTS public.daily_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    time_range TEXT, -- e.g., "10:00 - 12:00"
    description TEXT NOT NULL,
    maps_url TEXT,
    file_url TEXT,
    location_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Automation: Auto-generate Daily Slots
Requirement: "Automatically generate day slots based on start_date and end_date".

```sql
-- Function to generate activity slots for each day of the trip
CREATE OR REPLACE FUNCTION public.handle_new_trip()
RETURNS TRIGGER AS $$
DECLARE
    current_day DATE;
BEGIN
    -- 1. Create entry in trip_details
    INSERT INTO public.trip_details (trip_id) VALUES (NEW.id);

    -- 2. Generate slots for each day (at least one empty entry per day to show in UI)
    current_day := NEW.start_date;
    WHILE current_day <= NEW.end_date LOOP
        INSERT INTO public.daily_activities (trip_id, activity_date, description)
        VALUES (NEW.id, current_day, 'Planejamento do dia');
        current_day := current_day + 1;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger after trip creation
CREATE TRIGGER on_trip_created
    AFTER INSERT ON public.trips
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_trip();
```

### Automation: Updated At Triggers
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_trips_modtime BEFORE UPDATE ON public.trips FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_trip_details_modtime BEFORE UPDATE ON public.trip_details FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_daily_activities_modtime BEFORE UPDATE ON public.daily_activities FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
```

## 2. Storage Configuration

### Buckets
- **Bucket Name:** `travel-assets`
- **Public Access:** Yes (Read access for everyone with the link).
- **Structure:**
  - `trips/{trip_id}/accommodation/`
  - `trips/{trip_id}/transport/`
  - `trips/{trip_id}/activities/`

## 3. Security (Row Level Security - RLS)

Since this is a personal app with a Gate Page:
- **Enable RLS** on all tables.
- **Policies:**
  - For now, given the "Gate Page" approach (password `senha1234`), we can use the `anon` key for the prototype.
  - *Recommendation:* Create a policy that allows all operations for the `anon` role (for development) or use Supabase Auth with a single hardcoded user to truly secure it.

```sql
-- Basic RLS for prototyping (Enable for all tables)
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;

-- Allow all access to anon (simplest for the "Gate Page" model)
CREATE POLICY "Allow all for anon" ON public.trips FOR ALL USING (true);
CREATE POLICY "Allow all for anon" ON public.trip_details FOR ALL USING (true);
CREATE POLICY "Allow all for anon" ON public.daily_activities FOR ALL USING (true);
```

## 4. Environment Variables (.env)

```env
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GATE_PASSWORD=senha1234
```
