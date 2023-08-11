# Indie Hackers RSS

[ihrss.io](https://ihrss.io) provides users to access the latest and most popular stories from [Indie Hackers](https://www.indiehackers.com) in RSS format.

> RSS updates are not real-time, they are updated every five minutes to minimize the impact on the Indie Hackers website.

<a href="https://www.buymeacoffee.com/yuexunjiang"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=yuexunjiang&button_colour=FFDD00&font_colour=000000&font_family=Comic&outline_colour=000000&coffee_colour=ffffff" /></a>

## Feeds

### Based on Homepage
```
https://ihrss.io/:type
```

- Organic Stories: `https://ihrss.io/organic`
- Featured Stories: `https://ihrss.io/featured`
- Newest Stories: `https://ihrss.io/newest`

### By Group

```
https://ihrss.io/group/:name
```

#### Popular groups:
- Building in Public: `https://ihrss.io/group/building-in-public`
- Growth: `https://ihrss.io/group/growth`
- 12 Startups in 12 Months: `https://ihrss.io/group/12-startups-in-12-months`

### By Time
```
https://ihrss.io/top/(today|week|month|all-time)
```

- Today: `https://ihrss.io/top/today` (Equivalent to the entire homepage feed)
- This Week: `https://ihrss.io/top/week`
- This Month: `https://ihrss.io/top/month`
- All Time: `https://ihrss.io/top/all-time`

## Contribution

If you have suggestions or find any issues, please open an issue on GitHub or submit a pull request.

## Colophon

ihrss.io is powered by Node.js and hosted on [Cloudflare Worker](https://workers.cloudflare.com).

## License

This project is licensed under the MIT License. For more details, see the [LICENSE](LICENSE) file.

