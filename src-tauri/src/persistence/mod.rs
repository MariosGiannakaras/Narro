use rusqlite::Connection;
use rusqlite_migration::{Migrations, M};

pub fn run_migrations(conn: &mut Connection) -> Result<(), rusqlite_migration::Error> {
    let migrations = Migrations::new(vec![
        M::up(include_str!("../../migrations/0001_initial.sql")),
    ]);

    migrations.to_latest(conn)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_migrations_fresh_and_repeated() {
        let mut conn = Connection::open_in_memory().unwrap();
        
        // Fresh migration
        let res1 = run_migrations(&mut conn);
        assert!(res1.is_ok(), "Fresh migration should succeed");
        
        // Verify table exists
        let mut stmt = conn.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='_diagnostic_startup'").unwrap();
        let exists = stmt.exists([]).unwrap();
        assert!(exists, "Table _diagnostic_startup should exist after migration");

        // Repeated migration
        let res2 = run_migrations(&mut conn);
        assert!(res2.is_ok(), "Repeated migration should succeed without errors");
    }
}
