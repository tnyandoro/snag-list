import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://lsubblpsgxdounziipok.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjkzOWYzYzZlLTI3MDctNDc5MS05Nzc5LWFjN2Q0Y2Q3YzZlNCJ9.eyJwcm9qZWN0SWQiOiJsc3ViYmxwc2d4ZG91bnppaXBvayIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY5NzYzMzU1LCJleHAiOjIwODUxMjMzNTUsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.EdrSg2iT9uF5mN5KDF7H7zFxyVhhahLIf7R8K79cZG0';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };