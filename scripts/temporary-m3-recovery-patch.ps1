$ErrorActionPreference = 'Stop'

function Replace-Exact([string]$Path, [string]$Old, [string]$New) {
  $content = Get-Content $Path -Raw
  if (-not $content.Contains($Old)) { throw "Expected patch target missing in $Path" }
  $content = $content.Replace($Old, $New)
  Set-Content $Path $content -Encoding utf8
}

Replace-Exact 'src-tauri/src/timer/mod.rs' @'
mod lifecycle;
pub use lifecycle::{TaskExitReason, TimerExit, TimerSwitchResult};
'@ @'
mod lifecycle;
mod recovery;
pub use lifecycle::{TaskExitReason, TimerExit, TimerSwitchResult};
pub use recovery::{TimerRecoveryCheckpoint, TimerRecoveryPhase};
'@

Replace-Exact 'src-tauri/src/timer/mod.rs' @'
    ZeroDuration,
    DurationOverflow,
}
'@ @'
    ZeroDuration,
    DurationOverflow,
    InvalidRecoveryState,
}
'@

Replace-Exact 'src-tauri/src/timer/mod.rs' @'
            Self::ZeroDuration => formatter.write_str("timer durations must be greater than zero"),
            Self::DurationOverflow => formatter.write_str("timer duration arithmetic overflow"),
        }
'@ @'
            Self::ZeroDuration => formatter.write_str("timer durations must be greater than zero"),
            Self::DurationOverflow => formatter.write_str("timer duration arithmetic overflow"),
            Self::InvalidRecoveryState => formatter.write_str("persisted timer recovery state is invalid"),
        }
'@

cargo fmt --manifest-path src-tauri/Cargo.toml
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
