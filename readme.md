# In progress!

## How to make backend work

1. For backend: install pipenv
```bash
pip install pipenv
```

2. Create the virtual environment
```bash
pipenv install
```

3. Install Flask web framework in the virtual enviroment
```bash
pipenv install flask google.genai
```

4. Add the dependency for the Google Cloud SDK or for HTTP requests
```bash
pipenv install google-cloud-aiplatform requests
```

## How to make frontend work

1. You have to install node in your machine: ```https://nodejs.org/en/download```

2. Install node with react-app in the frontend file
```bash
npx create-react-app frontend
```
>ps: this would take a while

3. Navigate to the new file
```bash
cd frontend
```

4. Test if the project installed properly
```bash
npm start
```
> This will open a window in your browser, in port=3000 with a generic react page

5. Install the styles dependencies
```
npm install -D tailwindcss@3.4.17 postcss autoprefixer
npx tailwindcss init -p
```

4. If the installation was done properly, this command should work again
```bash
npm start
```

4. if doesnt work, something went work during the installation, run this command:
```bash
npm cache clean --force
```
> Ps: after running it, DELETE the folder frontend

5. Start again from the step number 2
