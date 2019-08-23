const puppeteer = require('puppeteer');

// 1. Create new file named 'account.txt' in current folder.
// 2. Input your github username and password with two lines.
const [username, password] = require('fs').readFileSync('account.txt', 'utf-8').split('\n');

const repository = {
    name: 'github-repository-auto-creator',
    description: 'A script for auto-creating one github repository base puppeteer.',
    isPublic: true,
};

const selectors = {
    username: '#login_field',
    password: '#password',
    login: '[type=submit]',

    new: '[class="details-overlay details-reset"]',
    href: '[data-ga-click="Header, create new repository"]',

    repositoryName: '#repository_name',
    repositoryDescription: '#repository_description',
    repositoryPrivate: '#repository_visibility_private',
    repositoryAutoInit: '#repository_auto_init',
    repositoryCreate: '#new_repository > div.js-with-permission-fields > button',
};

const urls = {
    github: 'https://github.com/login?return_to=%2Fgithub',
};

async function createGitRepository(callback, closeWhenFinish = false) {
    const call = e => callback && callback(e);
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 50,
    });
    call('启动Chrome');
    const page = await browser.newPage();
    // page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    // await page.screenshot({path: 'mtl.png'});

    // login
    await page.goto(urls.github);
    call('打开: ' + urls.github);
    await page.type(selectors.username, username);
    call('输入用户名: ' + username);
    await page.type(selectors.password, password);
    call('输入密码: ' + password.replace(/./g, '*'));
    await page.click(selectors.login);
    call('登录...');
    await page.waitFor(1000);

    // new
    await page.click(selectors.new);
    await page.waitFor(500);
    await page.click(selectors.href);
    call('跳转新建仓库页面');
    await page.waitFor(1000);

    // repository
    const {name, description, isPublic} = repository;
    await page.type(selectors.repositoryName, name);
    call('输入仓库名: ' + name);
    await page.type(selectors.repositoryDescription, description);
    call('输入仓库描述: ' + description);
    if (!isPublic) {
        await page.click(selectors.repositoryPrivate);
        call('选择私有仓库');
    }
    await page.click(selectors.repositoryAutoInit);
    call('选择初始化仓库');
    await page.click(selectors.repositoryCreate);
    call('创建仓库');
    await page.waitFor(1000);

    if (closeWhenFinish) {
        call('关闭浏览器');
        await browser.close();
    }
}

(async () => createGitRepository(e => console.log(e)))();