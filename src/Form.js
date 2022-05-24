import {useEffect, useState} from "react";
import axios from "axios";

export default function Form({reload, message, close}) {
    const [files, setFiles] = useState([]);
    const [images, setImages] = useState([]);
    const [text, setText] = useState(message?.text);
    const [error, setError] = useState({});

    function messageChange() {
        const formData = new FormData();
        for (const f of files) {
            formData.append("images", f);
        }

        formData.append("text", text);
        axios.post(message ? `/api/post/${message.id}/update` : '/api/post/create', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(() => {
                console.log(files)
                setFiles([])
                setImages([])
                setText('')
                close()
                reload()
            })
            .catch(e=>{
                console.warn(e.response.data)
                setError(e.response.data)
            })
    }

    useEffect(() => {
        const imgs = []
        files.forEach(file => {
            if (!file.type.match('image')) return console.log(file.type)
            const fileReader = new FileReader();
            fileReader.onload = (e) => {
                const {result} = e.target;
                if (result) {
                    imgs.push(result)
                }
                if (imgs.length === files.length) {
                    setImages(imgs);
                }
            }
            fileReader.readAsDataURL(file);
        })
    }, [files])


    const addFiles = (e) => {
        e.preventDefault()
        const f = []
        for (const file of e.target.files) {
            f.push(file)
        }
        setFiles(f)
    }

    function deleteImage(img) {
        axios.delete(`/api/image/${img.id}/delete`)
            .then(() => {
                reload()
            })
            .catch(e=>{
                console.warn(e.response.data)
                setError(e.response.data)
            })
    }
    function destroy() {
        axios.delete(`/api/post/${message.id}/delete`)
            .then(() => {
                reload()
            })
            .catch(e=>{
                console.warn(e.response.data)
                setError(e.response.data)
            })
    }

    return <div className="form">
        {message && <button onClick={close}>Close</button>}
        <textarea onChange={({target}) => setText(target.value)} rows={10} value={text}/>
        <br/>
        <input type="file" multiple onChange={addFiles}/>
        <button onClick={messageChange}>{message ? 'Update' : 'Create'}</button>
        <button onClick={destroy}>Destroy</button>
        {error.message && <div style={{color: 'red'}}>{error.message}</div>}
        <hr/>
        <div className="images-list">
            {
                message && message.images.map((image, idx) => {
                    return <span>
                    <img className="preview" src={'/api' + image.path} alt="" key={idx}/>
                        <br/>
                    <button onClick={() => deleteImage(image)}>Delete</button>
                </span>
                })
            }
            {
                images.map((image, idx) => {
                    return <img className="preview" src={image} alt="" key={idx}/>
                })
            }
        </div>
    </div>
}