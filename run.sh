while(true); do
	git commit -a -m "media and commands"
	git pull
	git push
	yarn start
done
