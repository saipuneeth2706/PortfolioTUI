use crossterm::event::{self, Event, KeyCode, KeyEventKind};
use ratatui::widgets::{List, ListItem, Tabs};
use ratatui::{
    DefaultTerminal, Frame,
    layout::{Constraint, Direction, Layout},
    style::{Color, Modifier, Style},
    text::{Line, Span},
    widgets::{Block, Borders, Paragraph, Wrap},
};
use serde::Deserialize;
use std::sync::{Arc, Mutex};
use std::time::Duration;

#[derive(Clone, Copy)]
pub enum Page {
    Home,
    Projects,
    Contact,
}

impl Page {
    pub fn iterator() -> impl Iterator<Item = Page> {
        [Page::Home, Page::Projects, Page::Contact].iter().copied()
    }
    pub fn title(&self) -> &'static str {
        match self {
            Page::Home => " Home ",
            Page::Projects => " Projects ",
            Page::Contact => " Contact ",
        }
    }
}

pub struct App {
    pub current_page: Page,
    pub tab_index: usize,
    pub should_quit: bool,
    pub github_profile: Arc<Mutex<Option<GithubProfile>>>,
    pub links: Vec<(&'static str, &'static str)>,
    pub selected_link_index: usize,
}

#[derive(Deserialize, Debug, Clone)]
pub struct GithubProfile {
    pub login: String,
    pub location: String,
    pub twitter_username: String,
    pub bio: Option<String>,
}

use reqwest::Client;
use std::error::Error;

pub async fn fetch_github_profile(username: &str) -> Result<GithubProfile, Box<dyn Error>> {
    let client = Client::new();
    let url = format!("https://api.github.com/users/{}", username);

    let response = client
        .get(&url)
        .header("User-Agent", "TUI-Portfolio-App")
        .send()
        .await?;

    let profile = response.json::<GithubProfile>().await?;
    Ok(profile)
}

impl App {
    pub fn new() -> Self {
        Self {
            current_page: Page::Home,
            tab_index: 0,
            should_quit: false,
            github_profile: Arc::new(Mutex::new(None)),
            links: vec![
                ("GitHub", "https://github.com/saipuneeth2706"),
                ("LinkedIn", "https://linkedin.com/in/saipuneethreddypally"),
                ("Website", "https://portfolio-react-ulnf.onrender.com/"),
                ("Twitter", "https://twitter.com/rsaipuneeth"),
                ("Youtube", "https://youtube.com/@saipuneethreddypally"),
            ],

            selected_link_index: 0,
        }
    }
    pub fn next_tab(&mut self) {
        self.tab_index = (self.tab_index + 1) % 3;
        self.update_page_from_tab();
    }
    pub fn previous_tab(&mut self) {
        if self.tab_index > 0 {
            self.tab_index -= 1;
        } else {
            self.tab_index = 2;
        }
        self.update_page_from_tab();
    }
    fn update_page_from_tab(&mut self) {
        self.current_page = match self.tab_index {
            0 => Page::Home,
            1 => Page::Projects,
            _ => Page::Contact,
        };
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut terminal = ratatui::init();
    let mut app = App::new();
    let profile_state = Arc::clone(&app.github_profile);
    tokio::spawn(async move {
        if let Ok(profile) = fetch_github_profile("saipuneeth2706").await {
            // Lock the mutex and update the data once it arrives
            let mut lock = profile_state.lock().unwrap();
            *lock = Some(profile);
        }
    });
    let result = run_app(&mut terminal, &mut app);
    ratatui::restore();
    result.map_err(|e| e.into())
}

fn run_app(terminal: &mut DefaultTerminal, app: &mut App) -> std::io::Result<()> {
    while !app.should_quit {
        terminal.draw(|f| ui(f, app))?;

        if event::poll(Duration::from_millis(100))? {
            if let Event::Key(key) = event::read()? {
                if key.kind == KeyEventKind::Press {
                    match key.code {
                        KeyCode::Char('q') => app.should_quit = true,
                        KeyCode::Tab => app.next_tab(),
                        KeyCode::BackTab => app.previous_tab(),

                        _ => {}
                    }
                }
            }
        }
    }
    Ok(())
}

fn ui(frame: &mut Frame, app: &App) {
    let area = frame.area();

    let global_layout = Layout::default()
        .direction(Direction::Vertical)
        .constraints([
            Constraint::Length(3),
            Constraint::Min(0),
            Constraint::Length(1),
        ])
        .split(area);

    let titles: Vec<Line> = Page::iterator().map(|p| Line::from(p.title())).collect();
    let tabs = Tabs::new(titles)
        .block(
            Block::default()
                .borders(Borders::ALL)
                .title(" Sai Puneeth's Portfolio "),
        )
        .select(app.tab_index)
        .style(Style::default().fg(Color::DarkGray))
        .highlight_style(
            Style::default()
                .fg(Color::Cyan)
                .add_modifier(Modifier::BOLD),
        );

    frame.render_widget(tabs, global_layout[0]);

    match app.current_page {
        Page::Home => render_home(frame, app, global_layout[1]),
        Page::Projects => render_projects(frame, app, global_layout[1]),
        Page::Contact => render_contact(frame, app, global_layout[1]),
    }

    let footer = Paragraph::new(
        " Navigate: [Tab/Shift+Tab] Tabs | [q] Quit | Cmd/Ctrl+Click links to open ",
    )
    .style(Style::default().fg(Color::DarkGray).bg(Color::Gray))
    .centered();
    frame.render_widget(footer, global_layout[2]);
}

fn render_home(frame: &mut Frame, app: &App, area: ratatui::layout::Rect) {
    let vertical_layout = Layout::default()
        .direction(Direction::Vertical)
        .constraints([
            Constraint::Length(3),
            Constraint::Min(0),
            Constraint::Length(1),
        ])
        .split(area);

    let body_layout = Layout::default()
        .direction(Direction::Horizontal)
        .constraints([Constraint::Percentage(60), Constraint::Percentage(40)])
        .split(vertical_layout[1]);

    let header_text = Paragraph::new(Line::from(vec![
        Span::styled(
            " Sai Puneeth ",
            Style::default()
                .fg(Color::Cyan)
                .add_modifier(Modifier::BOLD),
        ),
        Span::raw(" | "),
        Span::styled("Terminal Portfolio", Style::default().fg(Color::DarkGray)),
    ]))
    .block(
        Block::default()
            .borders(Borders::ALL)
            .border_style(Style::default().fg(Color::Cyan)),
    );

    frame.render_widget(header_text, vertical_layout[0]);

    let about_text = vec![
        Line::from("Welcome to my TUI Portfolio!"),
        Line::from(""),
        Line::from("I am a final-year Computer Science and Engineering student."),
        Line::from(
            "I have a strong passion for low-level programming, AI, and building robust systems.",
        ),
        Line::from(""),
        Line::from("Currently exploring:"),
        Line::from("- Systems programming in Rust"),
        Line::from("- Building custom AI tools and RAG models"),
        Line::from("- Tinkering with Linux environments"),
        Line::from(""),
    ];

    let about_widget = Paragraph::new(about_text)
        .block(Block::default().title(" About Me ").borders(Borders::ALL))
        .wrap(Wrap { trim: true });

    frame.render_widget(about_widget, body_layout[0]);

    let profile_lock = app.github_profile.lock().unwrap();

    let mut links_text = vec![];

    for (name, url) in app.links.iter() {
        links_text.push(Line::from(vec![
            Span::styled(
                format!("{}: ", name),
                Style::default()
                    .fg(Color::Green)
                    .add_modifier(Modifier::BOLD),
            ),
            Span::styled(
                *url,
                Style::default()
                    .fg(Color::Cyan)
                    .add_modifier(Modifier::UNDERLINED),
            ),
        ]));
    }

    links_text.push(Line::from(""));
    links_text.push(Line::from("-------------------------"));

    match &*profile_lock {
        Some(profile) => {
            links_text.push(Line::from(format!("GitHub: {}", profile.login)));
            links_text.push(Line::from(format!("Location: {}", profile.location)));
            links_text.push(Line::from(format!(
                "Twitter: @{}",
                profile.twitter_username
            )));
            if let Some(bio) = &profile.bio {
                links_text.push(Line::from(format!("Bio: {}", bio)));
            }
        }
        _ => {
            links_text.push(Line::from(vec![Span::styled(
                "Fetching GitHub stats...",
                Style::default()
                    .fg(Color::DarkGray)
                    .add_modifier(Modifier::RAPID_BLINK),
            )]));
        }
    }

    links_text.push(Line::from(""));
    links_text.push(Line::from("-------------------------"));
    links_text.push(Line::from("Pinned Repos:"));
    links_text.push(Line::from("> Multi-threaded web server"));
    links_text.push(Line::from("> Threadly (In Dev)"));

    let links_widget = Paragraph::new(links_text).block(
        Block::default()
            .title(" Connect: Click on the links to open them ")
            .borders(Borders::ALL),
    );

    frame.render_widget(links_widget, body_layout[1]);

    let footer_text =
        Paragraph::new(" Built with Rust and Ratatui | Press 'q' to Quit | Hosted on Oracle Cloud")
            .style(Style::default().fg(Color::White).bg(Color::DarkGray))
            .centered();
    frame.render_widget(footer_text, vertical_layout[2]);
}
fn render_projects(frame: &mut Frame, _app: &App, area: ratatui::layout::Rect) {
    let projects = vec![
        ListItem::new(Line::from(vec![
            Span::styled(
                "1. Threadly",
                Style::default()
                    .fg(Color::Yellow)
                    .add_modifier(Modifier::BOLD),
            ),
            Span::raw(" - Transforming Gmail into a WhatsApp-like interface. (In Dev)"),
        ])),
        ListItem::new(Line::from("")),
        ListItem::new(Line::from(vec![
            Span::styled(
                "2. Rust Web Server",
                Style::default()
                    .fg(Color::Yellow)
                    .add_modifier(Modifier::BOLD),
            ),
            Span::raw(" - A multi-threaded web server built from scratch to understand internals."),
        ])),
        ListItem::new(Line::from("")),
        ListItem::new(Line::from(vec![
            Span::styled(
                "3. TUI Portfolio",
                Style::default()
                    .fg(Color::Yellow)
                    .add_modifier(Modifier::BOLD),
            ),
            Span::raw(" - This interactive terminal application, built with Ratatui."),
        ])),
        ListItem::new(Line::from("")),
        ListItem::new(Line::from(vec![
            Span::styled(
                "4. Portfolio Website",
                Style::default()
                    .fg(Color::Yellow)
                    .add_modifier(Modifier::BOLD),
            ),
            Span::raw(" - Personal portfolio website."),
        ])),
    ];

    let projects_list = List::new(projects).block(
        Block::default()
            .title(" Featured Work ")
            .borders(Borders::ALL),
    );

    frame.render_widget(projects_list, area);
}

fn render_contact(frame: &mut Frame, _app: &App, area: ratatui::layout::Rect) {
    let contact_text = vec![
        Line::from(
            "Let's connect! I am always open to discussing systems programming, AI, or new opportunities.",
        ),
        Line::from(""),
        Line::from(vec![
            Span::styled("Email:   ", Style::default().fg(Color::Cyan)),
            Span::raw("saipuneeth2004@gmail.com"), // You can update this to your actual email
        ]),
        Line::from(vec![
            Span::styled("Website: ", Style::default().fg(Color::Cyan)),
            Span::raw("portfolio-react-ulnf.onrender.com/"), // You can update this to your actual website
        ]),
        Line::from(""),
        Line::from("I am also active on GitHub and LinkedIn. Check the Home tab for direct links!"),
    ];

    let contact_widget = Paragraph::new(contact_text)
        .block(
            Block::default()
                .title(" Get In Touch ")
                .borders(Borders::ALL),
        )
        .wrap(Wrap { trim: true })
        .centered();

    let center_layout = Layout::default()
        .direction(Direction::Vertical)
        .constraints([
            Constraint::Percentage(25),
            Constraint::Percentage(50),
            Constraint::Percentage(25),
        ])
        .split(area);

    frame.render_widget(contact_widget, center_layout[1]);
}
