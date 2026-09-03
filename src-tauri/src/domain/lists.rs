use super::ids::ListId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ListRecord {
    pub id: ListId,
    pub title: String,
    pub color: Option<String>,
    pub icon_asset: Option<String>,
    pub sort_rank: u32,
    pub archived_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct NewListInput {
    pub title: String,
    pub color: Option<String>,
    pub icon_asset: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct UpdateListInput {
    pub title: String,
    pub color: Option<String>,
    pub icon_asset: Option<String>,
}

impl From<NewListInput> for UpdateListInput {
    fn from(value: NewListInput) -> Self {
        Self {
            title: value.title,
            color: value.color,
            icon_asset: value.icon_asset,
        }
    }
}
