import User from '../../models/User'
import { server } from '../../index'
import { connection } from 'mongoose'
import { api , initialUsers } from '../helpers'

describe('/api/auth/sign-in', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    for(let initialUser of initialUsers){
      const initialUserObject = new User(initialUser)
      await initialUserObject.save()
    }
  })

  test('User sign in successfully, receive a token and dont receive the password', async () => {
    /*  User sign in */
    const response = await api
      .post('/api/auth/sign-in')
      .send({
        email: initialUsers[0].email,
        password: initialUsers[0].decodePass,
      })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    /* Verifiying the response */
    expect(response.body.success).toBeTruthy()
    expect(response.body.content.token).toBeDefined()
    expect(response.body.content.password).toBeUndefined()
    expect(response.body.content.email).toBe(initialUsers[0].email)
    expect(response.body.message).toBe('Inicio de sesión exitoso')
  })

  describe('User can not sign in without a required field',()=>{
    test('without email', async () => {
      /* Making the request without email */
      const response = await api
        .post('/api/auth/sign-in')
        .send({
          password: initialUsers[0].decodePass,
        })
        .expect(400)
        .expect('Content-Type', /application\/json/)
      
      expect(response.body.success).toBeFalsy()
      expect(response.body.message).toBe(`El campo email es requerido`)
    })

    test('without password', async () => {
      /* Making the request without password */
      const response = await api
        .post('/api/auth/sign-in')
        .send({
          email: initialUsers[0].email,
        })
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(response.body.success).toBeFalsy()
      expect(response.body.message).toBe(`El campo password es requerido`)

    })
  })

  describe('User can not sign in with invalid fields', () => {
    test('Invalid email', async () => {
      /* Making the request with an invalid email */
      const response = await api
        .post('/api/auth/sign-in')
        .send({
          email: 'admin@example',
          password: 'sadadsad'
        })
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(response.body.success).toBeFalsy()
      expect(response.body.message).toBe('El email es inválido')
    })

    test('Invalid password', async () => {
      /* Making the request with an invalid password */
      const response = await api
        .post('/api/auth/sign-in')
        .send({
          email: initialUsers[0].email,
          password: 'pass'
        })
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(response.body.success).toBeFalsy()
      expect(response.body.message).toBe('La contraseña debe tener 6 caracteres como mínimo')
    })
  })

  test('User can not sign in with an email which not exists', async () => {
    /* Making the request with a non existent email */
    const response = await api
      .post('/api/auth/sign-in')
      .send({
        email: 'invented@example.com',
        password: 'password123'
      })
      .expect(404)
      .expect('Content-Type', /application\/json/)

      expect(response.body.success).toBeFalsy()
      expect(response.body.message).toBe('El email invented@example.com no se encuentra registrado')
  })

  test('User can not sign in with an incorrect password', async () => {
    /* Making the request with an incorrect password */
    const response = await api
      .post('/api/auth/sign-in')
      .send({
        email: initialUsers[0].email,
        password: 'inventedPass',
      })
      .expect(403)
      .expect('Content-Type', /application\/json/)

    expect(response.body.success).toBeFalsy()
    expect(response.body.message).toBe('Contraseña incorrecta')
  })

  afterAll(async () => {
    await connection.close()
    server.close()
  })
})