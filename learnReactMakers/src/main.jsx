import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import "./style/index.css"
import { BrowserRouter } from "react-router-dom"
import { HelmetProvider } from "react-helmet-async"
import { Provider } from "react-redux"
import { store } from "./TaskManagement/store/store" // ← dari file baru

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </Provider>
)