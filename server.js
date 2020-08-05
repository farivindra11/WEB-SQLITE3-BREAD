const express = require('express')
const path = require('path');
const bodyParser = require('body-parser')
const fs = require('fs')
const app = express();

//sqlite3
const { query } = require('express');
const { Console } = require('console');
const sqlite3 = require('sqlite3').verbose();


//db connection
const db_name = path.join(__dirname, './database/bread.db')
const db = new sqlite3.Database(db_name, (err) => {
    if (err) {
        return console.error(err.message)
    }
    console.log("Successful Database Integration : 'bread.db'")
})


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())


app.use('/', express.static(path.join(__dirname, 'public')));

// app.get('/', (req, res) => res.render('list', {data})); //list.ejs

app.get('/add', (req, res) => res.render('add'));

// Search, Pagination, list
app.get('/', (req, res) => {
    let dataSearch = []
    let search = false

    if (req.query.checkId && req.query.id) {
        dataSearch.push(`id = ${req.query.id}`)
        search = true
    }

    if (req.query.checkString && req.query.string) {
        dataSearch.push(`string = "${req.query.string}"`)
        search = true
    }

    if (req.query.checkInteger && req.query.integer) {
        dataSearch.push(`integer = "${req.query.integer}"`)
        search = true
    }

    if (req.query.checkFloat && req.query.float) {
        dataSearch.push(`float = "${req.query.float}"`)
        search = true
    }

    if (req.query.checkDate && req.query.startDate && req.query.endDate) {
        dataSearch.push(`date BETWEEN '${req.query.startDate}' AND '${req.query.endDate}'`)
        search = true
    }

    if (req.query.checkBoolean && req.query.boolean) {
        dataSearch.push(`boolean = "${req.query.boolean}"`)
        search = true
    }

    let searchFinal = ""
    if (search) {
        searchFinal += `WHERE ${dataSearch.join(' AND ')}`
    }
   
    const page = req.query.page || 1
    const limit = 3
    const offset = (page - 1) * limit


    db.all(`SELECT COUNT (id) as total FROM bread`, (err, rows) => {
        if (err) {
            return console.error(err.message)
        } else if (rows == 0) {
            return res.send('data not found')
        } else {
            total = rows[0].total
            const pages = Math.ceil(total / limit)
            
            let sql = `SELECT * FROM bread ${searchFinal} LIMIT ? OFFSET ?`
            db.all(sql, [limit,offset], (err, rows) => {

                if (err) {
                    return console.error(err.message)
                } else if (rows == 0) {
                    return res.send('No data');
                } else {
                    let data = [];
                    rows.forEach(row => {
                        data.push(row);
                    });
                    res.render('list', { data, page, pages })
                }
            })
        }
    })
})


//ADD
app.post('/add', (req, res) => {
    let result = req.body;
    db.serialize(() => {
        let sql = `INSERT INTO bread (string, integer, float, date, boolean) Values (?,?,?,?,?)`
        db.run(sql, [result.string, result.integer, result.float, result.date, result.boolean], (err) => {
            if (err) {
                return console.error(err.message);
            }
            res.redirect('/');
        });
    });
});

//DELETE
app.get('/delete/:id', (req, res) => {
   let id = req.params.id
   let sql = `DELETE FROM bread WHERE id = ?`
   db.run(sql, id, (err) => {
       if ( err) {
           return console.error(err.message);
       }
       res.redirect('/');
   });
});

// //EDIT
app.get('/edit/:id', (req, res) => {
    let id = req.params.id
    let sql = `SELECT * FROM bread WHERE id = ?`
    db.get(sql, id, (err, row) => {
        if (err) {
            return console.error(err.message)
        }
        res.render('edit', { row })
    })
})
app.post('/edit/:id', (req, res) => {
    let id = req.params.id
    let edit = [req.body.string, req.body.integer, req.body.float, req.body.date, req.body.boolean, id]
    let sql = `UPDATE bread SET string = ? , integer = ? , float = ? , date = ? , boolean = ? WHERE id = ?`

    db.run(sql, edit, (err) => {
        if (err) {
            return console.error(err.message)
        }
        res.redirect('/')
    })
})


app.listen(3000, () => {
    console.log('port ini berjalan di port 3000');
})