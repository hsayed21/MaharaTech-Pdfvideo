<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/hsayed21/MaharaTech-Pdfvideo">
    <img src="https://i.imgur.com/TvHFmrP.png" alt="Logo" width="300" height="200">
  </a>

  <h3 align="center">MaharaTech-Pdfvideo</h3>

  <p align="center">
    Create Material From Videos
    <br />
    <br />
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

The purpose of the script is that some people, including me, preferably while watching the video, I like to have a material to record my notes and because it is not provided in [Maharatech](https://maharatech.gov.eg), I Decide to create a script to automate that.
The idea of the script is converting each video into frames according to what you want, how many frames per second?.
After that, similar images will be deleted by a lot of algorithms from  [czkawka](https://github.com/qarmin/czkawka)
Finally, use any converter to convert images to PDF.


### Built With
* [Node.js](https://nodejs.org/)



<!-- GETTING STARTED -->
## Getting Started
### Prerequisites

- Download <b>windows_czkawka_cli.exe</b> from release [qarmin/czkawka](https://github.com/qarmin/czkawka/releases/)
- Download [Node.js](https://nodejs.org/en/)

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/hsayed21/MaharaTech-Pdfvideo
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3.  Add your username to the ".env" file
    ```
    echo "_user=your_username" > .env
    ```
4.  Add your password to the ".env" file
    ```
    echo "_pass=your_password" >> .env
    ```
5.  Run script
    ```
    npm start
    ```

<!-- CONTRIBUTING -->
## Contributing

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* [qarmin/czkawka](https://github.com/qarmin/czkawka)
* [Parthipan-Natkunam/datastructure-practical-applications](https://github.com/Parthipan-Natkunam/datastructure-practical-applications/tree/master/hashmap)
* [Generating video previews with Node.js and FFmpeg - LogRocket Blog](https://blog.logrocket.com/generating-video-previews-with-node-js-and-ffmpeg/)
* [jsgilberto/youtube-frames: A small library to get images from YouTube videos.](https://github.com/jsgilberto/youtube-frames)
