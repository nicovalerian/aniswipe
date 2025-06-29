# Plan to Fix Anime Recommendation Logic

## Problem Analysis

The investigation revealed two main reasons for the discrepancy between the expected and actual anime recommendations:

1.  **Watched Anime Not Filtered**: The API does not filter out anime that the user has already watched, allowing them to appear in the recommendation list.
2.  **Reranking Logic Skew**: The `rerank_score` formula gives significant weight to an anime's overall community score and popularity, potentially overshadowing recommendations that are a better match for the user's specific taste.

## Plan for Resolution

### 1. Enable Filtering of Watched Anime (Immediate Fix)

The most critical change is to filter out anime the user has already seen. This will be done by modifying `api/main.py` to uncomment the filtering logic.

**File**: [`api/main.py`](api/main.py)
**Action**: Uncomment the line that checks if `anime_id` is in `watched_ids`.

```python
# api/main.py
# ...
    for i, score in sim_scores:
        anime_id = df_processed['anime_id'].iloc[i]
        # UNCOMMENT THE FOLLOWING LINE
        if anime_id not in watched_ids:
            potential_recommendations.append({'index': i, 'anime_id': anime_id, 'similarity': score})
# ...
```

### 2. Adjust Reranking Logic (Further Improvement)

To make recommendations more personalized, the reranking formula needs adjustment. The current formula is:
`rerank_score = similarity * (score + 1) * log(members)`

This can be adjusted to give more weight to the `similarity` score. This step can be discussed and implemented after the initial fix.

### Logic Flow Diagram

This diagram illustrates the change from the current logic to the proposed, improved logic.

```mermaid
graph TD
    subgraph Current Logic
        A[User Profile] --> B{Cosine Similarity};
        C[Anime Dataset] --> B;
        B --> D{Rerank Score};
        C --> D;
        D --> E[Top Recommendations];
    end

    subgraph Proposed Logic
        F[User Profile] --> G{Cosine Similarity};
        H[Anime Dataset] --> G;
        G --> I{Filter Watched};
        I --> J{Adjusted Rerank Score};
        H --> J;
        J --> K[Personalized Recommendations];
    end

    style E fill:#f9f,stroke:#333,stroke-width:2px
    style K fill:#bbf,stroke:#333,stroke-width:2px