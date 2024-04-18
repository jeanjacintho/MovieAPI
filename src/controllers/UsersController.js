const AppError = require("../utils/AppError")
const knex = require("../database/knex")
const { hash, compare } = require("bcryptjs");

class UsersController {
    async create(request, response) {
        const {name, email, password} = request.body
    
        try {
            let checkUserExist
            checkUserExist = await knex('users').select().where('email', email).first()
    
            if(checkUserExist) {
                throw new AppError('This email already exists')
            }
    
            const hashedPassword = await hash(password, 8)
    
            await knex('users').insert({
                name,
                email,
                password: hashedPassword,
            })
    
            response.status(201).json()
        } catch (error) {
            response.status(400).json({ error: error.message })
        }
    }

    async update(request, response) {
        const { name, email, password, old_password } = request.body;
        const { id } = request.params;
    
        try {
            const user = await knex('users').select().where('id', id).first();
    
            if (!user) {
                throw new AppError('User not found');
            }
    
            if (email !== user.email) {
                const userWithUpdatedEmail = await knex('users').select().where('email', email).first();
    
                if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
                    throw new AppError('This email is already in use');
                }
            }
    
            user.name = name ?? user.name;
            user.email = email ?? user.email;
    
            if (password && !old_password) {
                throw new AppError('You need to enter your old password');
            }
    
            if (password && old_password) {
                const checkOldPassword = await compare(old_password, user.password);
    
                if (!checkOldPassword) {
                    throw new AppError('Passwords are not the same');
                }
    
                user.password = await hash(password, 8);
            }
    
            await knex('users')
                .where('id', id)
                .update({
                    name: user.name,
                    email: user.email,
                    password: user.password,
                    updated_at: knex.fn.now()
                });
    
            return response.status(200).json();
        } catch (error) {
            return response.status(400).json({ error: error.message });
        }
    }
}

module.exports = UsersController