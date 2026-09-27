import os, requests, datetime as dt
from supabase import create_client
from dotenv import load_dotenv

load_dotenv(".env.local")
sb = create_client(os.environ["NEXT_PUBLIC_SUPABASE_URL"],os.environ["SUPABASE_SERVICE_ROLE_KEY"])