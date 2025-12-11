# EthiX: Interactive Research Integrity Navigator

**EthiX** is an interactive, scenario-based simulation game designed to raise awareness of research integrity among graduate students and researchers. By role-playing through realistic academic dilemmas, users navigate the complex trade-offs between integrity, career advancement, scientific rigor, collaboration, and wellbeing.

The application leverages **Google Gemini 2.5** to generate infinite, context-aware scenarios and provide personalized, actionable mentorship feedback in multiple languages.

## Key Features

*   **Role-Playing Simulation**: Play as a PhD Student, Postdoc, PI, Lab Tech, Professor, or Journal Editor.
*   **AI-Driven Scenarios**: Uses LLMs to generate unique, non-repetitive ethical dilemmas based on user choices and selected topics.
*   **5-Dimension Growth Model**: Visualizes the impact of decisions on Integrity, Career, Rigor, Collaboration, and Wellbeing via a dynamic radar chart.
*   **Navigator System**: Provides real-time, constructive guidance ("Navigator Tips") rather than judgment.
*   **Topic Selection**: Focus on specific areas like Plagiarism, Authorship, Data Management, or Power Dynamics.
*   **Multi-Round Gameplay**: Survival-style gameplay where choices accumulate consequences over time.
*   **Multilingual Support**: Fully localized content generation based on user preference.


## Try the Demo

You can test this application directly in **Google AI Studio** via [this link](https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%2217n_DSSXmOfSe4euuEQRfV1nnBEMlquMy%22%5D,%22action%22:%22open%22,%22userId%22:%22104881785806373648881%22,%22resourceKeys%22:%7B%7D%7D&usp=sharing).

If interested, you can also copy the app and develop further based on it.

## Local Installation and Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Yiru-Jiao/EthiX.git
    cd ethix
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure API Key**:
    *   Create a `.env` file in the root directory.
    *   Add your Google Gemini API key:
        ```env
        API_KEY=your_google_genai_api_key_here
        ```

4.  **Run the application**:
    ```bash
    npm start
    ```

## Usage

1.  **Enter the Simulation**: Click "Enter Simulation" on the welcome screen.
2.  **Select a Role**: Choose a perspective (e.g., PhD Student) to understand specific challenges.
3.  **Choose Topics**: Select ethical areas you wish to explore.
4.  **Play Scenarios**: Make decisions in 5-turn rounds.
5.  **Review Feedback**: Learn from the consequences on your radar chart and read the "Navigator's Insight."

## License & Permissions

**Copyright © 2025 EthiX Project. All Rights Reserved.**

This project is licensed under a **Custom Educational & Scientific License**.

*   **Educational & Scientific Use**: You are encouraged to use, reuse, adapt, and further develop this application for **non-profit educational and scientific purposes**, provided that **proper reference and attribution** is given to the original author.
*   **Commercial Use**: Commercial use is **permitted**, provided that **proper reference** is given and **communication** is established with the author.

See the [LICENSE](LICENSE) file for full details.