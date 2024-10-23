import { createRoot } from 'react-dom/client'
import App from './Components/App/App.jsx'
import './LUX_bootstrap.min.css'
import { BrowserRouter } from 'react-router-dom'


createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
    
)
