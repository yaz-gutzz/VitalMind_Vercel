export function adminRequired(req,res,next){

    if(!req.user){

        const error = new Error(
            "Usuario no autenticado"
        );

        error.status=401;

        return next(error);
    }


    if(req.user.role !== "admin"){

        const error = new Error(
            "Acceso solo para administradores"
        );

        error.status=403;

        return next(error);
    }


    next();

}