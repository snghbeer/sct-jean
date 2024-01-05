export const createUserSessionTable: string = `
    CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT ENCRYPTED,
    role SMALLINT,
    token VARCHAR(255)
    );

    CREATE TABLE IF NOT EXISTS product_session (id INTEGER PRIMARY KEY, json_data TEXT);

    CREATE TABLE IF NOT EXISTS category_session (id INTEGER PRIMARY KEY, json_data TEXT);

    CREATE TABLE IF NOT EXISTS table_session (id INTEGER PRIMARY KEY, json_data TEXT);

`;

//user session
export const insertUserSessionQry: string = `INSERT OR REPLACE INTO users (id, username, password, role, token) VALUES (1,?,?,?,?);`
export const deleteUserSessionQry: string = `DELETE FROM users WHERE id = 1;`
export const checkUserSessionCache: string = `SELECT * FROM users WHERE id = 1 LIMIT 1;`

//table session
export const getTableSession: string = "SELECT * FROM table_session LIMIT 1";
export const updateTableSessionnQry= (jsonString: string) => `UPDATE table_session SET json_data = ('${jsonString}') WHERE id = 1;`
export const insertTableSessionQry = (jsonString: string) => `
INSERT INTO table_session (id, json_data)
VALUES (1, '${jsonString}')
ON CONFLICT (id) DO UPDATE SET json_data = '${jsonString}';
`

//products
export const getProductsSession: string = "SELECT * FROM product_session LIMIT 1";
export const insertProductsSessionnQry: string = `INSERT INTO product_session (json_data) VALUES (?);`
export const updateProductsSessionnQry= (jsonString: string) => `UPDATE product_session SET json_data = ('${jsonString}') WHERE id = 1;`
export const insertProdsSessionQry2 = (jsonString: string) => `
INSERT INTO product_session (id, json_data)
VALUES (1, '${jsonString}')
ON CONFLICT (id) DO UPDATE SET json_data = '${jsonString}';
`

//categories
export const getCategoriesSession: string = "SELECT * FROM category_session LIMIT 1";
export const insertProdSessionnQry: string = `INSERT INTO category_session (json_data) VALUES (?);`
export const updateCatSessionnQry= (jsonString: string) => `UPDATE category_session SET json_data = ('${jsonString}') WHERE id = 1;`
export const insertCatsSessionnQry2 = (jsonString: string) => `
INSERT INTO category_session (id, json_data)
VALUES (1, '${jsonString}')
ON CONFLICT (id) DO UPDATE SET json_data = '${jsonString}';
`