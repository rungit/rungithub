# www.rungithub.com

This is a node.js application which uses Terminal.com to let users run github projects

The idea is that **www.rungithub.com/[username]/[reponame]** will take you to a Terminal with the repository cloned and ready to go!  So instead of cloning and setting up locally, you can simply insert “run” before github.com.

By default, all this does is start a default snapshot and run git clone.
If your project requires complicated or time-intensive installation, you can specify a setup script to run upon being cloned.
Or even better, you can set up your own snapshot on Terminal.com which is ready to go!

To use this customization, simply include in the root directory of your github project, a file called **terminal.json** (or **.terminal.json**).

This should be a json file with the following fields (all optional):

| Field             | Description                                              | Default                                                                                                    |
|-------------------|----------------------------------------------------------|----------------------------------------------------------------------                                      |
| snapshot\_id      | The Terminal.com snapshot which should be started        | [this](https://www.terminal.com/snapshot/4f452850f26d9f22536c87be7b1834bd32cf2b53882d8833a6c2ad3304d2d1b2) |
| repo\_dir         | The directory in which the repository lies/should lie    | /home/[reponame]                                                                                           |
| startup           | A setup script which should be ran (from the repo\_dir)  | [empty]                                                                                                    |

