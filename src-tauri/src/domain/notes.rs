use super::ids::TaskId;
use serde::{Deserialize, Serialize};

pub const TASK_NOTE_FORMAT_VERSION: u32 = 1;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(deny_unknown_fields)]
pub struct NoteDocument {
    pub blocks: Vec<NoteBlock>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
pub enum NoteBlock {
    Paragraph { runs: Vec<NoteTextRun> },
    BulletList { items: Vec<NoteListItem> },
    NumberedList { items: Vec<NoteListItem> },
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct NoteListItem {
    pub runs: Vec<NoteTextRun>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct NoteTextRun {
    pub text: String,
    #[serde(default, skip_serializing_if = "is_false")]
    pub bold: bool,
    #[serde(default, skip_serializing_if = "is_false")]
    pub italic: bool,
    #[serde(default, skip_serializing_if = "is_false")]
    pub strikethrough: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub link: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TaskNoteRecord {
    pub task_id: TaskId,
    pub editor_format_version: u32,
    pub document: NoteDocument,
    pub updated_at: String,
}

fn is_false(value: &bool) -> bool {
    !*value
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rich_note_json_round_trip_is_explicit_and_version_independent() {
        let document = NoteDocument {
            blocks: vec![
                NoteBlock::Paragraph {
                    runs: vec![NoteTextRun {
                        text: "Narro".into(),
                        bold: true,
                        italic: false,
                        strikethrough: false,
                        link: Some("https://example.com/docs".into()),
                    }],
                },
                NoteBlock::BulletList {
                    items: vec![NoteListItem {
                        runs: vec![NoteTextRun {
                            text: "Persist locally".into(),
                            bold: false,
                            italic: true,
                            strikethrough: false,
                            link: None,
                        }],
                    }],
                },
            ],
        };

        let encoded = serde_json::to_string(&document).expect("serialize note document");
        assert!(!encoded.contains("<p>"));
        assert!(!encoded.contains("javascript:"));
        let decoded: NoteDocument =
            serde_json::from_str(&encoded).expect("deserialize note document");
        assert_eq!(decoded, document);
    }

    #[test]
    fn unknown_document_fields_are_rejected() {
        let value = r#"{"blocks":[],"html":"<script>alert(1)</script>"}"#;
        assert!(serde_json::from_str::<NoteDocument>(value).is_err());
    }
}
