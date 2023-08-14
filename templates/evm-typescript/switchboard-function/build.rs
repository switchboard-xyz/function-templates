fn main() {
    // Read the environment variable
    let value = std::env::var("SWITCHBOARD_RECEIVER_ADDRESS")
        .expect("SWITCHBOARD_RECEIVER_ADDRESS must be set");

    // Pass it to the Rust compiler
    println!("cargo:rustc-env=SWITCHBOARD_RECEIVER_ADDRESS={}", value);
}
