import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState(''); // Sẽ là StudentCode
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        const postData = new FormData();
        postData.append('Email', email);
        postData.append('Password', password);

        try {
            const response = await fetch('http://localhost/Library/Connection/actions/actionForStudent.php?action=login', {
                method: 'POST',
                body: postData,
            });
            const result = await response.json();

            if (result.success) {
                login(result.data); // Lưu thông tin người dùng vào context
                navigate(from, { replace: true }); // Chuyển hướng về trang trước đó hoặc trang chủ
            } else {
                setError(result.message || 'Đăng nhập thất bại.');
            }
        } catch (err) {
            console.error('Lỗi đăng nhập:', err);
            setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
        }
    };

    return (
        <div className="login-form-container">
            <header>
                <span>Login</span>
                <h2>Welcome Back</h2>
            </header>
            <form onSubmit={handleSubmit} className="login-form">

                <section className='input-submit'>
                    <label >Email Address</label>
                    <input type="email" placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} required />
                </section>


                <section className='input-submit'>
                    <label >Password </label>
                    <div className="pass">
                        <input id='passWord' type={isPasswordVisible ? "text" : "password"} placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <i 
                            className={isPasswordVisible ? "ri-eye-off-fill" : "ri-eye-fill"} 
                            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        ></i>
                    </div>
                </section>

                <section className='forget'>
                    <p><input type="radio" />Remember me</p>
                    <a href="javaScript:void(0);">Forgot password?</a>
                </section>

                {error && <p className="login-error">{error}</p>}
                <section className="btn">
                    <button className='submit'>Submit</button>
                    <hr />
                    <div className="btn-more">
                        <label>Don't have an account? don't wonry</label>
                        <button className='btn-dangky' onClick={() => navigate(`/create`)}>Create an account</button>
                        <button className='submit-with'><img src="/7611770.png"  />Continue with Google</button>
                    </div>
                </section>
            </form>
        </div>
    );
}

export default LoginForm;