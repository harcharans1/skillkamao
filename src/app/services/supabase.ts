import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class Supabase {

  private supabase: SupabaseClient;

  constructor() {

    const supabaseUrl = 'https://ecqeloajceqkqbkcjqbp.supabase.co';

    const supabaseKey = 'sb_publishable_QtnJ997k2G5K2g_BlDaQpQ_TzSvlLGY';

    this.supabase = createClient(
      supabaseUrl,
      supabaseKey
    );
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }
}