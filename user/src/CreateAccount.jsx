import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Component cho form đăng ký của người dùng thông thường
const UserRegisterForm = () => {
    return (
        <div className="register-form">
            <h3>Đăng ký cho Người dùng</h3>
            <form action="">
                <section>
                    <label>Username</label>
                    <input type="text" />
                </section>
                <section>
                    <label>Email</label>
                    <input type="text" />
                </section>
                
                <section>
                    <label>Password</label>
                    <input type="password" />
                </section>

                

                <div className="register-form-btn">
                    <button type='submit'>Sign Up</button>
                </div>
            </form>
           
        </div>
    );
}

// Component cho form đăng ký của sinh viên
const StudentRegisterForm = () => {
    
    // const navigate = useNavigate(); 

    return (
        <div className="register-form">
            <h3>Đăng ký cho Sinh viên</h3>
           <form action="">
                <section>
                    <label>Enter your Student Code</label>
                    <input type="number" />
                </section>
                <section>
                    <label>School/University</label>
                    <input type="text" />
                </section>
                <section>
                    <label>Username</label>
                    <input type="text" />
                </section>
                <section>
                    <label>Email</label>
                    <input type="text" />
                </section>
                
                <section>
                    <label>Password</label>
                    <input type="password" />
                </section>

                <section>
                    <label htmlFor="">Date of Birth</label>
                    <input type="date" />
                </section>

                <section>
                    <label htmlFor="">Gender</label>
                    <select name="" id="">
                        <option value="">man</option>
                        <option value="">Woman</option>
                    </select>
                </section>

                <section>
                    <label htmlFor="">Number Phone</label>
                    <input type="text" />
                </section>

                <section>
                    <label htmlFor="">Address</label>
                    <input type="text" />
                </section>

                <section>
                    <label htmlFor="EnrollmentYear"></label>
                    <input type="text" />
                </section>

                <section>
                    <label htmlFor="">Major</label>
                    <input type="text" />
                </section>

                <section>
                    <label htmlFor="">Faculty</label>
                    <input type="text" />
                </section>

                <div className="register-form-btn">
                    <button type='submit'>Sent</button>
                </div>
            </form>
           
        </div>
    )
}

function CreateAccount() {
    // State để quản lý loại tài khoản được chọn, mặc định là 'user'
    const [accountType, setAccountType] = useState('user');

    // Hàm xử lý khi người dùng thay đổi lựa chọn
    const handleTypeChange = (event) => {
        setAccountType(event.target.value);
    };

    return(
        <section>
            <div className="chosse-user-student">
                <div className="chosse-main">
                    <label>
                        <input 
                            type="radio" 
                            value="user"
                            checked={accountType === 'user'}
                            onChange={handleTypeChange}
                        />
                        Người dùng
                    </label>
                    <label>
                        <input 
                            type="radio" 
                            value="student"
                            checked={accountType === 'student'}
                            onChange={handleTypeChange}
                        />
                        Sinh viên
                    </label>
                </div>
            </div>

            {/* Render component tương ứng dựa trên state accountType */}
            <div className="form-display-area">
                {accountType === 'user' ? <UserRegisterForm /> : <StudentRegisterForm />}
            </div>
        </section>
    )
}

export default CreateAccount;