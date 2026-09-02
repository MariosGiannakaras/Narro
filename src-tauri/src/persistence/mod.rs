use rusqlite::Connection;
use rusqlite_migration::{Migrations, M};

pub fn run_migrations(conn: &mut Connection) -> Result<(), rusqlite_migration::Error> {
    let migrations = Migrations::new(vec![
        M::up(include_str!("../../migrations/0001_initial.sql")),
    ]);

    migrations.to_latest(conn)
}
