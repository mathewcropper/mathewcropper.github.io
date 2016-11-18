---
layout: post
title: "My VPN and PGP encryption setup"
date: 2016-11-18
category: tech
---

[The snooper's charter is to become law in the UK](http://www.wired.co.uk/article/ip-bill-law-details-passed), giving the UK government unprecedented reach into our digital lives.

I don't want to get into the whys and wherefores of that debate. Suffice it to say, this was enough to push me to seek greater privacy. I chose to use VPN to encrypt my traffic, and PGP to encrypt my email.

VPN stands for Virtual Private Network ([wiki](https://en.wikipedia.org/wiki/Virtual_private_network)), and creates a private (potentially secure) network within a public one. This hides much of what you are doing from someone monitoring that public network.

PGP stands for Pretty Good Privacy ([wiki](https://en.wikipedia.org/wiki/Pretty_Good_Privacy)), and is a means for encrypting and decrypting email. It uses digital signatures to give some confidence that the sender is who you think they are, and to make sure that the message hasn't been tampered with. In fact, Edward Snowden used PGP [when he reached out to journalists](https://theintercept.com/2014/10/28/smuggling-snowden-secrets/).

## My VPN setup

There are **lots** of VPN solutions out there, with different features and price points. I chose to use [Cloak VPN](https://www.getcloak.com) for a few reasons:

* Reviews, press, and discussions were overarchingly positive. [Their own page](https://support.getcloak.com/faq/advanced-vpn-users/) for _advanced_ VPN users is honest about what they do and don't do, as is their [technology and cryptography page](https://support.getcloak.com/faq/technology/).
* It's been around as a consumer product for a while.
* You pay once for access across all devices, with no limits on concurrency.
* Simple setup for both macOS and iOS, which are my workhorses. Apple devices are Cloak's sweet spot.

The key features for me were the always-on encryption, as well as the ability to [set the country I appear to be visiting from](https://www.getcloak.com/about/transporter/).

[Take a look at the Cloak review on VPN Mentor](https://www.vpnmentor.com/reviews/cloak-vpn/), or their [best VPNs list](https://www.vpnmentor.com/bestvpns/overall/).

![](/images/posts/20161118_cloak_ios.PNG)

## My PGP setup

I use email on desktop (macOS), mobile (iOS), and tablet (iOS), so need to be able to encrypt email easily from each of those devices.

Here's what I use..

### macOS

Install [GPG Suite](https://gpgtools.org) and follow their [quick start tutorial](https://gpgtools.tenderapp.com/kb/how-to/first-steps-where-do-i-start-where-do-i-begin-setup-gpgtools-create-a-new-key-your-first-encrypted-mail). This will install GPG tools on your Mac, create your secret and public keys, and help you send your first encrypted email using PGP encryption.

Once you're up and running, import the public keys for the people you correspond with. Check with them that you have the right keys if you are doing this for the first time.

You can look up public keys using the [MIT PGP key server](http://pgp.mit.edu), or in tools you download.

You'll find my public key [here](http://pgp.mit.edu/pks/lookup?op=vindex&search=0x11112BC5C824E910). The fingerprint for my public key is `1C02 C758 FAAD E71A C1A2  1C97 1111 2BC5 C824 E910`.

If you're using macOS Sierra, as I am, the current version of GPG Mail doesn't work for encrypting or decrypting messages. Not to worry, though, as simply selecting text and navigating to **Mail > Services > OpenPGP** will allow you to encrypt or decrypt. If you're using Apple's Mail app, you can right click on selected text and go straight to **Services** from there.

![](/images/posts/20161118_gpg_services_1.png)

### iOS

Install [iPGMail](https://ipgmail.com), which currently costs £1.49 in the UK App Store. It's not a pretty app, but it does the job. There are others out there, but this is the only iOS app referenced on official PGP sites.

Once installed, follow [these instructions to export your keys from your macOS device](https://gpgtools.tenderapp.com/kb/gpg-keychain-faq/backup-or-transfer-your-keys), and then follow [these instructions to install those keys in iPGMail on your iOS device](https://ipgmail.com/guide/#airdrop). You'll need to add the public keys for the people you correspond with again.

To encrypt a message, open iPGMail and go to the **Compose** tab. From there you can write an email and send it or, if you would prefer, copy it to clipboard for use elsewhere.

When you receive a PGP encrypted email, copy its contents, open iPGMail, go to the **Decode** tab. It will detect the PGP encrypted message on your clipboard, ask if you want to import it, and then ask for the password for your own private key.

![](/images/posts/20161118_ipgmail_import.PNG)

The one major limitation with iPGMail is that there is no action sheet integration, meaning that to use it you'll have to open the app from your home screen. If you're doing a lot of emailing from your mobile device, then this may not be the best for you.

## Limitations of PGP

The above methods encrypt the content of my messages, but they do not do anything to hide the metadata that goes with them. For example, the [email headers](http://whatismyipaddress.com/email-header) that tell you information _about_ the message.

For example, from the header of the email you can determine the sender, recipient, time the message was sent, the device/browser I sent it from etc.