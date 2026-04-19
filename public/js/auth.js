const signUpButton = document.getElementById('signUp');
        const signInButton = document.getElementById('signIn');
        const container = document.getElementById('container');

        // Check URL for mode (e.g. /signup)
        if (window.location.pathname === '/signup') {
            container.classList.add("right-panel-active");
        }

        signUpButton.addEventListener('click', () => {
            container.classList.add("right-panel-active");
            window.history.pushState({}, '', '/signup');
        });

        signInButton.addEventListener('click', () => {
            container.classList.remove("right-panel-active");
            window.history.pushState({}, '', '/login');
        });

        // Login Submit
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const errDiv = document.getElementById('loginError');
            
            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await res.json();
                if (res.ok) {
                    window.location.href = '/';
                } else {
                    errDiv.textContent = data.msg || 'Login failed';
                    errDiv.style.display = 'block';
                }
            } catch (error) {
                errDiv.textContent = 'Server error. Please try again.';
                errDiv.style.display = 'block';
            }
        });

        // Signup Submit
        document.getElementById('signupForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const errDiv = document.getElementById('signupError');
            
            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                
                const data = await res.json();
                if (res.ok) {
                    window.location.href = '/';
                } else {
                    errDiv.textContent = data.msg || 'Signup failed';
                    errDiv.style.display = 'block';
                }
            } catch (error) {
                errDiv.textContent = 'Server error. Please try again.';
                errDiv.style.display = 'block';
            }
        });