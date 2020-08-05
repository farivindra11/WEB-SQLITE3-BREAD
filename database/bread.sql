CREATE TABLE bread (
    id INTEGER PRIMARY KEY NOT NULL,
    string TEXT,
    integer INTEGER,
    float FLOAT,
    date DATE,
    boolean BOOLEAN
);
INSERT INTO bread (string, integer, float, date, boolean)
VALUES ('Test data', 11, '12,3', '2020-03-12', 'true'),
        ('Fariv', 22, '14.6', '1998-03-11', 'true');