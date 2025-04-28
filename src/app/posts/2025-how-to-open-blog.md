---
title: "2025了如何搭建一个个人博客"
date: 2025-04-28T11:34:42.809Z
slug: 2025-how-to-open-blog
---

我每年都写一篇类似的文章，关于如何搭建一个个人博客的
I write about this topic every year: how to start a personal blog site.

从古老的php+mysql搭建wordpress到github pages，再到nextjs+sanity
From ancient Wordpress site via php+mysql to github pages, and to the most recent nextjs + sanity framework. 

2025了，有没有其他更简单的方法呢？在这个时间就是金钱的时代，搭建一个博客的难度和时间会把绝大多数人的写作热情浇灭。
Now it's 2025, do we have any other easier ways? Most people couldn't even start thinking about it due to the complexity setting up a personal blog site.

现在有了Firebase Studio（帮你写代码的），再加上Github（帮你保存代码的），搭建一个个人博客只需要10分钟
With Firebase Studio who writes code for you and GitHub who hosts code for you, setting up your personal blog site can be done in 10 mins

第一步，登陆Firebase Studio并让它帮你写一个个人博客站，大概耗时2-5分钟，基于你对UI的要求。同步写好的代码到你的GitHub新repo。
Step 1, go to Firebase studio and ask it to code a personal blog site for you. It would take 2-5 mins base on your UI requirements. Synchronize the generated code to your GitHub account with a new repo.
a nextjs blog site which allows admin user to manage posts and write back files to github repo
第二步，新建一个GitHub project并记录id和secret，把这些记录到你的github新repo的env里
Step 2, create a new GitHub project and note its id and secret, update these info into the env file of your synced repo.

第三步，确保配置正确后发布你的博客站到google或者到Vercel，记得把发布好的地址添加到GitHub Project的CORS里，完成了
Step 3, publish your site to Google or if you prefer Vercel. Just remember to update the CORS origins in your github project to the correct published url.

没有第四步了，这就完成了！你有没有发现我们一行代码都没写就完成了所有？更神奇的是这些都能在浏览器完成，也就是说只要有一部能上网的手机，或者平板，普通人都能短时间做到这一切！
There's no Step 4! Did you realize that you just finished everything without writing a single line of code? And what's more, everything was done with just a browser? Which means anyone with a cellphone or pad can do this in a very short time!