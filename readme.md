# In progress!

## How to make it work

1. Clone the repository
```bash
git clone https://github.com/HamzaNouman/Gemini-ChatBot
```

2. Create a venv
```bash
python -m venv venv
```

3. Install the requirments
```bash
pip install -r requirements.txt
```

4. Create a .env file and add your gemini api key
```bash
.env=YOUR_API_KEY_HERE
```

5. Install pipenv to create a new environment
```bash
pip install pipenv
```

6. Create the virtual environment
```bash
pipenv install
```

7. Install Flask web framework in the virtual enviroment
```bash
pipenv install flask
```

8. Add the dependency for the Google Cloud SDK or for HTTP requests
```bash
pipenv install google-cloud-aiplatform requests
```



