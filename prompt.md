在这个文件夹下面帮我开发一个谷歌浏览器插件， 插件页面展示2个tab：待填写、已填写，在待填写页面可以添加日志，填写的内容包括：项目、日志内容、工时、日期，添加的内容可以修改，用列表展示已添加的数据。
- 列表后面显示一个填充按钮，点击可以将这条日志自动填充到我们公司的日志页面(这个后面再实现)
- 填充完成的数据展示到“已填写”tab中去
- 界面UI清新大方，符合现代审美，扁平风格，有质感


待填写页面展示紧凑一些，点击添加按钮再显示要填写的字段，工时和日期展示到一行，待填写列表下面增加tab，每个项目对应一个tab；增加一个预设项目按钮来预设可以挑选的项目，新增日志时直接挑选项目


接下来，实现提交按钮的功能，点击提交后，将待填写的日志填充到公司的日志页面，对应日志页面地址：https://oa.epoint.com.cn/epointprojectm/projectmanage/mission/missionapply/missionapplyadd。对应的页面代码路径：日志页面\missionapplyadd.html。填充的位置是填充到页面的datagrid中，填充的内容包括：任务名称、工作内容、申请工时，任务时间默认是当前日期。如果datagrid中的行数不够，自动增加新的行。


点击“提交”按钮，判断当前浏览器是否处于https://oa.epoint.com.cn/epointprojectm/projectmanage/mission/missionapply/missionapplyadd页面，否则提示：请先打开非功能任务申请页面，然后点击提交按钮。missionapplyadd页面打开时会默认加载三条任务数据到datagrid中，点击提交按钮后，请你将对应的任务数据填充到datagrid中，如果datagrid中的行数不够，自动增加新的行。


提交按钮的功能实现不正确，没有将数据填充到正确的位置。我们现在有的字段是：任务名称、工作内容、申请工时、任务时间，需要把这些字段的值填充到datagrid中对应的位置。你需要在页面上找到每个字段对应的位置，比如第一行的任务名称字段，它的id是mini-54$1$2$editor$text，工作内容的id是mini-54$1$9$editor$text，申请工时的id是mini-54$1$11$editor$text，任务时间的id是mini-54$1$10$editor$text。第二行任务名称的id是mini-54$2$2$editor$text。大概是这样的。注意：不要修改missionapplyadd页面的代码，这个是页面的源码，你修改没有任何作用，你要实现的是浏览器插件的功能。注意代码的正确性，不要修改之后导致插件无法使用。


填充时存在一个问题，每次都只填充了datagrid中的第一条日志，需要优化为，如果已经填充了行不要覆盖，要填充到新的行去。如果datagrid中的行数不够，自动增加新的行。


很好，有进步了，但是还存在一个问题，我司的日志填写页面默认会加载三条数据到datagrid，现在当这三条都填充完了之后，又会去覆盖第一条，我希望的是，三条都填充完毕后，再点击提交按钮要自动创建新行进行填充，创建新行可以调用页面上的HandleRowAdd方法。现在一直没发实现新行的创建，请你帮我实现。


接下来需要完成一个很关键的任务，需要在插件加载时，自动填充一个“蓝图目标”，蓝图选择是跳转到新页面（https://oa.epoint.com.cn/epointprojectm/projectmanage/mission/missionapply/selectblueprint?ProjectGuid=34fa4c60-0eb8-4d8b-8c43-ce71557530f2&ContractGuid=&_dialogId_=EEE5C95E-4348-4F51-888C-4D75B17D17D7&_t=558159&_winid=w1971）来选择的，每个项目都有不同的蓝图目标，选择后会执行下面这段代码的操作： var BluePrintLevel = rtnValue.BluePrintLevel;
        var oldContractGuid=mini.get("ContractGuid").getValue();
        mini.get("BluePrint_Formal").setText(rtnValue.BluePrint_Formal);
        mini.get("BluePrint_Formal").setValue(rtnValue.BluePrint_FormalGuid);
        mini.get("BluePrintLevel").setValue(BluePrintLevel);
        mini.get("ContractGuid").setValue(rtnValue.ContractGuid);
        mini.get("IsWYSJSHT").setValue(rtnValue.IsWYSJSHT);
        mini.get("contractnumber").setValue(rtnValue.ContractNumber);你来分析下，我应该如何进行一个预设配置，才能实现自动挑选蓝图


如果当前页面不是missionapplyadd页面，则不要显示预设配置已加载的提示；如果预设正常加载，在工具标题右边显示一个精美的绿色的勾的图标；成功的taost提示改为绿色背景色

预设页面修改预设项目信息时，要同步修改任务列表中的项目名称，以及项目分类标签的名称，以及新增日志页面下拉选择的项目信息


在页面底部增加一个状态指示器，小巧，悬浮显示，当处于missionapplyadd页面，或者missionapplyadd页面处于当前浏览器打开的页面时（不一定是地址栏中显示的，有可能是作为一个子窗口打开的），指示器显示绿色勾，文字显示：正常，否则显示黄色横线，文字显示：非日志页面


底部的指示器在待填写页面时，增加显示工时统计，统计所有日志的工时，并显示在指示器中；如果按项目进行了筛选，则统计对应项目下的工时，并显示在指示器中


预设页面的，蓝图、工作场景、任务审核人预设的数据无法被删除，请修复这个问题，务必保证数据被正确删除。现在点击删除按钮只提示正在删除数据，但是并没有正确删除掉数据，当重新打开插件时，数据还在，这是一个严重的问题，请修复。