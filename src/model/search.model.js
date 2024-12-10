import pool from "../config/db.connect.js";

const SearchModel = {
    searchTrack: async (search_query) => {
        try {
            const query = `
                WITH track_info AS (
                    SELECT 
                        t.id, 
                        t.title, 
                        t.lyrics, 
                        t.release_date, 
                        t.duration, 
                        t.language, 
                        t.track_url,
                        a.cover AS cover
                    FROM tracks t
                    LEFT JOIN track_album ta ON t.id = ta.track_id
                    LEFT JOIN albums a ON ta.album_id = a.id
                ),
                genres AS (
                    SELECT 
                        tg.track_id,
                        tg.genre_id
                    FROM track_genre tg
                ),
                artists AS (
                    SELECT 
                        ut.track_id,
                        u.display_name
                    FROM user_track ut
                    INNER JOIN users u ON ut.user_id = u.id
                )
                SELECT 
                    t.id,
                    t.title,
                    t.lyrics,
                    t.release_date,
                    t.duration,
                    t.language,
                    t.track_url,
                    t.cover,
                    COALESCE(array_agg(DISTINCT g.genre_id) FILTER (WHERE g.genre_id IS NOT NULL), '{}') AS genres,
                    COALESCE(array_agg(DISTINCT a.display_name) FILTER (WHERE a.display_name IS NOT NULL), '{}') AS artists
                FROM 
                    track_info t
                LEFT JOIN genres g ON t.id = g.track_id
                LEFT JOIN artists a ON t.id = a.track_id
                WHERE 
                    t.title ILIKE '%' || $1 || '%' OR  -- Tìm kiếm trong title với phần chứa
                    a.display_name ILIKE '%' || $1 || '%' OR  -- Tìm kiếm trong display_name của artists
                    t.lyrics ILIKE '%' || $1 || '%'  -- Tìm kiếm trong lyrics
                GROUP BY 
                    t.id, t.title, t.lyrics, t.release_date, t.duration, t.language, t.track_url, t.cover, a.display_name
                ORDER BY 
                    CASE
                        WHEN t.title ILIKE '%' || $1 || '%' THEN 1
                        WHEN a.display_name ILIKE '%' || $1 || '%' THEN 2
                        WHEN t.lyrics ILIKE '%' || $1 || '%' THEN 3
                        ELSE 4
                    END,
                    t.release_date DESC
                LIMIT 10;
            `;
            const result = await pool.query(query, [`%${search_query}%`]);
            return result.rows; // Trả về dữ liệu từ query
        } catch (error) {
            throw error; // Ném lỗi để xử lý tại nơi gọi hàm
        }
    },
    
    
    searchArtist: async (search_query) => {
        try {
        const query = `SELECT * FROM users WHERE display_name ILIKE '%' || $1 || '%' AND user_role = 'artist'`;
        const result = await pool
            .query(query, [`%${search_query}%`]);
        return result.rows;
        } catch (error) {
        return error;
        }
    },
    searchAlbum: async (search_query) => {
        try {
        const query = `SELECT * 
            FROM albums
            WHERE title ILIKE '%' || $1 || '%' OR description ILIKE '%' || $1 || '%'
            ORDER BY 
                CASE
                    WHEN title ILIKE '%' || $1 || '%' THEN 1
                    WHEN description ILIKE '%' || $1 || '%' THEN 2
                    ELSE 3
                END;`;
        const result = await pool
            .query(query, [`%${search_query}%`]);
        return result.rows;
        } catch (error) {
        return error;
        }
    },

};

export default SearchModel;