import './app.sass';
import {useEffect, useState} from "react";
import axios from 'axios'
import Form from "./Form";

function App() {
    const [list, setList] = useState([]);
    const [user, setUser] = useState();
    const [edit, setEdit] = useState();
    const [error, setError] = useState({});

    async function post(path, payload) {
        return new Promise((resolve, reject) => {
            axios.post('/api' + path, payload, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then(async response => {
                    if (response.status !== 200) {
                        return reject(await response.data)
                    }
                    console.log(path, response.data)
                    resolve(response.data)
                })
                .catch(reject)

        })
    }

    useEffect(() => {
        getUser()
        postsList()
    }, [])

    async function getUser() {
        const user = await post('/user/view')
        console.log(user)
        setUser(user)
    }

    async function logout(e, form) {
        post('/user/logout')
        setUser()
        setError({})
    }

    async function login(e, form) {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(e.target));
        //TODO form validation
        const res = await post('/user/login', formData).catch(setError)
        if (!res) return
        setError({})
        setUser(res)
    }

    async function signup(e) {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(e.target));
        const res = await post('/user/signup', formData).catch(setError)
        if (!res) return
        setUser(res)
        setError({})
    }

    async function postsList() {
        const list = await post('/post/list')
        setList(list)
    }

    function close(){
        setEdit(null)
    }

    return (
        <div className="App">
            {!user && <div>
                <form onSubmit={login}>
                    <h2>Sign in</h2>
                    <input name="strategy" value="password" readOnly hidden/>
                    <input name="username" placeholder="username"/>
                    <input name="password" placeholder="password"/>
                    <button type="submit">Send</button>
                </form>
                <form onSubmit={signup}>
                    <h2>Sign up</h2>
                    <input name="strategy" value="password" readOnly hidden/>
                    <input name="username" placeholder="username"/>
                    <input name="password" placeholder="password"/>
                    <input name="password2" placeholder="confirmation"/>
                    <button type="submit">Send</button>
                </form>
            </div>}
            {error.status && <div style={{color: 'red'}}>{error.message}</div>}
            {user && <h1>{user.username}
                <button onClick={logout}>Logout</button>
            </h1>}
            {user && <Form close={close} reload={postsList}/>}
            <div style={{textAlign: 'left'}} className="postList">
                {list.map((l) => edit === l.id ? <Form close={close} reload={postsList} message={l}/> :
                    <div key={l.id} className="message">
                        <div className="head">
                            <small>{l.createdAt}</small>{' '}
                            <strong>{l.user?.username}</strong>
                            {user && l.user.id === user.id && <button onClick={() => setEdit(l.id)}>Edit</button>}
                        </div>
                        <div className="text">
                            {l.text}
                        </div>
                        {l.images.map(img => <img key={img.id} className="preview" src={'/api' + img.path}/>)}
                    </div>)}
            </div>


        </div>
    );
}

export default App;
