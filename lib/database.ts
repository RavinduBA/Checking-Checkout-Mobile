import { supabase } from './supabase';

// Generic database operations
export class DatabaseService {
  // Insert a record
  static async insert<T>(table: string, data: Partial<T>) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();

      if (error) {
        console.error(`Error inserting into ${table}:`, error);
        return { success: false, error };
      }

      return { success: true, data: result };
    } catch (error) {
      console.error(`Unexpected error inserting into ${table}:`, error);
      return { success: false, error };
    }
  }

  // Get all records from a table
  static async getAll<T>(table: string) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*');

      if (error) {
        console.error(`Error fetching from ${table}:`, error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error(`Unexpected error fetching from ${table}:`, error);
      return { success: false, error };
    }
  }

  // Get a record by ID
  static async getById<T>(table: string, id: string) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching from ${table} by ID:`, error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error(`Unexpected error fetching from ${table} by ID:`, error);
      return { success: false, error };
    }
  }

  // Update a record
  static async update<T>(table: string, id: string, data: Partial<T>) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating ${table}:`, error);
        return { success: false, error };
      }

      return { success: true, data: result };
    } catch (error) {
      console.error(`Unexpected error updating ${table}:`, error);
      return { success: false, error };
    }
  }

  // Delete a record
  static async delete(table: string, id: string) {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting from ${table}:`, error);
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      console.error(`Unexpected error deleting from ${table}:`, error);
      return { success: false, error };
    }
  }

  // Get records with filtering
  static async getWithFilter<T>(
    table: string,
    column: string,
    value: any,
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'like' | 'ilike' = '='
  ) {
    try {
      let query = supabase.from(table).select('*');

      switch (operator) {
        case '=':
          query = query.eq(column, value);
          break;
        case '!=':
          query = query.neq(column, value);
          break;
        case '>':
          query = query.gt(column, value);
          break;
        case '<':
          query = query.lt(column, value);
          break;
        case '>=':
          query = query.gte(column, value);
          break;
        case '<=':
          query = query.lte(column, value);
          break;
        case 'like':
          query = query.like(column, value);
          break;
        case 'ilike':
          query = query.ilike(column, value);
          break;
      }

      const { data, error } = await query;

      if (error) {
        console.error(`Error fetching from ${table} with filter:`, error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error(`Unexpected error fetching from ${table} with filter:`, error);
      return { success: false, error };
    }
  }
}
