import './App.css';
import {useEffect, useState} from "react";

function App() {
    const [list, setList] = useState([]);
    const [text, setText] = useState('');
    const [user, setUser] = useState();
    const [error, setError] = useState({});

    async function post(path, payload) {
        return new Promise((resolve, reject) => {
            fetch('/api' + path,
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                }
            )
                .then(async response => {
                    console.log(response)
                    if (response.status !== 200) return reject(await response.json())
                    return response.json();
                })
                .then(x => {
                    resolve(x)
                })
                .catch(reject)

        })
    }

    useEffect(() => {
        getUser()
        postsList()
    }, [])

    async function getUser() {
        const user = await post('/get/user')
        console.log(user)
        setUser(user)
    }

    async function logout(e, form) {
        post('/logout')
        setUser()
        setError({})
    }

    async function login(e, form) {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(e.target));
        //TODO form validation
        const res = await post('/login', formData).catch(setError)
        if (!res) return
        setError({})
        setUser(res)
    }

    async function signup(e) {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(e.target));
        const res = await post('/signup', formData).catch(setError)
        if(!res) return
        setUser(res)
        setError({})
    }

    async function postsList(){
        const list = await post('/post/list', {text})
        setList(list)
    }

    async function postCreate(){
        await post('/post/create', {text})
        postsList()
    }

    return (
        <div className="App">
            <div style={{textAlign:'left'}}>
            {list.map((l)=><div>{l.createdAt} <strong>{l.user?.username}</strong>: {l.text}</div>)}
            </div>
            {user && <div>
                <input onChange={({target})=>setText(target.value)}/>
                <button onClick={postCreate}>Send as "{user.username}"</button>
            </div>}
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
            {user && <button onClick={logout}>Logout</button>}
            {error.status && <div style={{color: 'red'}}>{error.message}</div>}
        </div>
    );
}

export default App;
