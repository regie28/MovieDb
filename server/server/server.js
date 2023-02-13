//import module/libraries
const express = require('express')
const parser = require('body-parser')
const { application } = require('express')
const Pool = require('pg').Pool

//initialize backend
const app = express()

app.use(express.json())

const port = 3000
const pool = new Pool(
    {
        user : 'postgres',
        host: 'localhost',
        database : 'movieDB',
        password : '1234',
        port : 5433
    }
)

app.get('/',(req, res) => {
    res.json(
        {
            info : 'Backend Running'
        }
    )
})

//Get all Movies

app.get('/movie', async (req, res) => {
   try {
    const movie = await pool.query("SELECT * FROM public.movie ORDER BY movieid ASC")
    res.json(movie.rows)
   } catch (error) {
    console.log(error)
   }
})
//Get All TV Shows
app.get('/tvshow', async (req, res) => {
    try {
     const tvshow = await pool.query("SELECT * FROM public.tvshow ORDER BY tvshowid ASC")
     res.json(tvshow.rows)
    } catch (error) {
     console.log(error)
    }
 })

//Get all User
app.get('/usermdb', async (req, res) => {
    try {
        const usermdb = await pool.query("SELECT * FROM public.usermdb ORDER BY userid ASC")
        res.json(usermdb.rows)
    } catch (error) {
        console.log(error)
    }
    })
    
app.listen(port, () => {
    console.log(`App listening to port ${port}`)
});