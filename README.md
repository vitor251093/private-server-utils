# Private Server Utils
Scripts that aid with the creation of private servers for apps and games that were shutdown by their parent companies.

This script was tested in a computer with Ubuntu, but it should work in macOS and Windows as well.

This script WON'T create a private game server for you automatically. It will give you the tool so you can develop a private server yourself, without the need of knowning a lot about packet sniffing or DNS name resolution.

## How do I use them?
First, you need to install TShark (and by instance, Wireshark). The first script (sniff-dns-list.js) relies on TShark to work. It should be used in combination with the startup of the said app/game so it can detect to which hosts it's trying to connect. Open the terminal/cmd, and run the command below from this project folder, replacing 40 with the time in seconds that you want the sniffing script to run.

```
sudo node sniff-dns-list.js 40
```

Right after running the command, open the app/game. If the app/game no longer has an official server, you should eventually reach an error, or any similar thing that proves that the server isn't there. When you see it, you can close the app/game. It's important that you run the sniffing script for enough time to reach that error.

Once it stops running, a file called dns_list.txt file should be created. Open it. There should be a DNS list in it. If you find any DNS that you are 100% sure that is not related to that app/game, remove that DNS from that file and copy it to the dns_blacklist.txt file, to save you the trouble in future re-runs, and prepare the file for the next step. If the file is empty, then the app/game didn't make a single request while the sniffing script was running, which may mean that you need to repeat the process with a bigger "sniffing time", or that the app/game is not trying to connect to the internet using a DNS.

Now you should run the command below. It will read the lines from the dns_list.txt file and add them to your hosts file, adding redirects that will make the app/game try to connect to your computer, instead of the original servers. It can executed multiple times safely, if needed.

```
sudo node update-hosts.js
```

Now, reboot your computer, or reload the hosts file, if you know how to do it. Open the terminal/cmd again, and run the command below from this project folder.

```
sudo node start-server.js
```

This will start a mock server, that is going to listen to all possible ports in your localhost, in order to find out what that app/game is looking for. Launch the app/game. You should see the error message again, or maybe even a different error message. Close it, and you will find, on terminal/cmd, a log, explaining which requests were made by the game. 

You can try to guess what you need to answer to that request, but if you are trying to ressurect a Windows game, I recommend you use an application like Hex-Rays or Ghidra to decompile the app/game EXE, so you can look for the portion of the code that is making that request, so you can figure out which kind of response it's expecting to receive.

I must be clear: the mock server most likely won't be enough to make that app/game work again, 100%. But it should be a good starting point, so you can create a server properly.
