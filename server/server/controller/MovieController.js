import { connectDatabase } from '../pool.js';
import { errorLogger, infoLogger } from '../utils/logger.js';


const pool = connectDatabase()


//Get all Movies
export const getAllMovies = async(req, res) => {
    try{
        const limit = req.query.limit || 10;
        const page = req.query.page || 1;
        const offset = (page - 1) * limit;
        const movies = await pool.query(`
        SELECT * FROM public.movie
        ORDER BY id ASC LIMIT$1 OFFSET $2`,[limit, offset]);
        res.status(200).send(movies.rows)
    } catch(err){
        errorLogger.error('Error')
    }
}

//Add Movies
export const createNewMovie = async(req, res) => {
    try {
        const {
            title,
            plot,
            language,
            budget,
            release_date,
            trailer_url,
            runtime,
        } = req.body;

        const userId = req.users.id;
        const userRole = req.users.role;
        const image = req.file;

        //Check if User is Admin or Moderator or Content Moderator
        if(userRole !== 'admin' || 'moderator' || 'content'){
            res.status(500).send("Unauthorized")
            return;
        }

        const movies = await pool.query(`SELECT * FROM public.movie WHERE title = $1`,[title])
        //Check if movie title already exists
        if(movies.rows.length > 0) {
            res.status(401).send("Movie Already Exists")
            return;
        }

        const newMovie = await pool.query(`INSERT INTO public.movie (title, plot, language, budget release_date, trailer_url, runtime )
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,[title, plot, language, budget, release_date, trailer_url,runtime])

        infoLogger.info(newMovie.rows[0])
        res.status(200).json(newMovie.rows[0])

        const movieId = newMovie.rows[0].id

        const newImage = await pool.query(`
        INSERT INTO public.image(filename, image_url)
        VALUES ($1, $2)
        RETURNING id`,[image.filename,image.path])

        const imageId = newImage.rows[0].id;

        await pool.query(`
        INSERT INTO public.movieposter(image_id,movie_id)
        VALUES ($1, $2)`,[imageId, movieId])
        res.status(201).send("Successfully Added")
    } catch(error){
        console.error(error);
        res.status(500).send("Unauthorized");
    }

}

//Delete
export const deleteMovie = async (req, res) => {
    try {
        const movieId =  req.params.id
        const userId = req.params.id

        const movies = await pool.query(`SELECT * FROM public.movie WHERE id = $1`,[movieId])
        const user_id = movies.rows[0].id
        infoLogger.info("userid:",user_id)
        if(userId === user_id) {
            const deleted = await pool.query(`DELETE FROM public.movie WHERE id = $1`,[movieId])
            res.status(200).json("Successfully Deleted")
            infoLogger.info("deleted")
        } else {
            res.status(401).json("Unauthorized")
        }
    } catch(error){
        errorLogger.error("error", error)
    }
}

//Update or Edit
export const updateMovie = async (req, res) => {
    try {
        const movieId =  req.params.id
        const userId = req.params.id
        infoLogger.info(`Movie ${movieId} userId: ${userId}`)

        const date = new Date()
        infoLogger.info("date:", date)

        const {
            title,
            plot,
            language,
            budget,
            release_date,
            trailer_url,
            runtime,
        } = req.body;

        const movies = await pool.query(`SELECT * FROM public.movie WHERE id = $1`,[movieId])
        const userid = movies.rows[0].id
        infoLogger.info("userId:",userid)
        if(userId === userid) {
            const edited = await pool.query(`UPDATE public.movie SET title = $1, plot = $2, language = $3, budget =$4, release_date = $5, trailer_url = $6 runtime = $7  WHERE id = $1`,[title,plot, language, budget, release_date, trailer_url, runtime, movieId])
            res.status(200).json({title,plot,language, budget, release_date, trailer_url, runtime})
            infoLogger.info("Movie Successfully Updated")
        } else {
            res.status(401).json("Unauthorized")
        }
    } catch(error){
        errorLogger.error("error", error)
    }
}
