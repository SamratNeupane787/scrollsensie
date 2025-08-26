-- Add engagement tracking columns to scroll_events table
ALTER TABLE public.scroll_events 
ADD COLUMN IF NOT EXISTS time_on_page INTEGER,
ADD COLUMN IF NOT EXISTS total_time_on_page INTEGER,
ADD COLUMN IF NOT EXISTS max_scroll_depth INTEGER,
ADD COLUMN IF NOT EXISTS scroll_events_count INTEGER,
ADD COLUMN IF NOT EXISTS engagement_data JSONB;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scroll_events_time_on_page ON public.scroll_events(time_on_page);
CREATE INDEX IF NOT EXISTS idx_scroll_events_max_scroll_depth ON public.scroll_events(max_scroll_depth);
CREATE INDEX IF NOT EXISTS idx_scroll_events_engagement_data ON public.scroll_events USING GIN(engagement_data);

-- Add comments for documentation
COMMENT ON COLUMN public.scroll_events.time_on_page IS 'Time spent on page when this event occurred (milliseconds)';
COMMENT ON COLUMN public.scroll_events.total_time_on_page IS 'Total time spent on page (milliseconds)';
COMMENT ON COLUMN public.scroll_events.max_scroll_depth IS 'Maximum scroll depth reached by user';
COMMENT ON COLUMN public.scroll_events.scroll_events_count IS 'Total number of scroll events for this session';
COMMENT ON COLUMN public.scroll_events.engagement_data IS 'JSON object containing detailed engagement metrics';