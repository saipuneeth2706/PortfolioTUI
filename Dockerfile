FROM archlinux:latest

# Install OpenSSH
RUN pacman -Sy --noconfirm openssh

# Generate SSH host keys
RUN ssh-keygen -A

# Copy your compiled Rust binary into the container
COPY target/release/ratatui_portfolio /usr/local/bin/portfolio
RUN chmod +x /usr/local/bin/portfolio

# Create a 'guest' user and set your app as their ONLY shell
RUN useradd -m -s /usr/local/bin/portfolio guest

# Set a simple password for the guest (e.g., username 'guest', password 'guest')
RUN echo "guest:guest" | chpasswd

RUN echo "/usr/local/bin/portfolio" >> /etc/shells

RUN echo "PasswordAuthentication yes" >> /etc/ssh/sshd_config

EXPOSE 22

# Run the SSH daemon in the foreground
CMD ["/usr/sbin/sshd", "-D"]
