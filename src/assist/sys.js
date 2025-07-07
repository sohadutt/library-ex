let darkmode = localStorage.getItem('darkmode')
const themeSwitch = document.getElementById('toggle-theme')

const enableDarkMode = () => {
    document.body.classList.add('darkmode')
    localStorage.setItem('darkmode', 'true')
}

const disableDarkMode = () => {
    document.body.classList.remove('darkmode')
    localStorage.setItem('darkmode', 'false')
}

if (darkmode === "true") {
    enableDarkMode()
}

themeSwitch.addEventListener('click', () => {
    darkmode = localStorage.getItem('darkmode')
    darkmode !== "true" ? enableDarkMode() : disableDarkMode()
})