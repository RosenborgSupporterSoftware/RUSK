import { ExtensionModule } from "./ExtensionModule";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { PostInfo } from "../Utility/PostInfo";
import { SettingType } from "../Configuration/SettingType";
import { ConfigurationOptionVisibility } from "../Configuration/ConfigurationOptionVisibility";
import { Log } from "../Utility/Log";

/**
 * EM_ModPostTools - Extension module for RBKweb.
 * Adds moderator functionality to posts if user is a moderator.
 */

export class ModPostTools implements ExtensionModule {
    readonly name: string = "ModPostTools";
    cfg: ModuleConfiguration;

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_FORUM_POSTLIST
    ];

    runBefore: Array<string> = [];
    runAfter: Array<string> = [];

    configSpec = () =>
        ConfigBuilder
            .Define()
            .EnabledByDefault()
            .WithExtensionModuleName(this.name)
            .WithDisplayName("Moderatorverktøy")
            .WithDescription("Legger til nyttige verktøy for moderatorer i context-menyen på innlegg.")
            .InvisibleToConfig()
            .Build();

    userIsModerator: boolean = false;

    init = (config: ModuleConfiguration) => {
        this.cfg = config;
    }

    posts: Array<PostInfo>;

    preprocess = () => {
        let modOnlyElement = document.querySelector('a img[src$="topic_delete.gif"]');
        this.userIsModerator = modOnlyElement != null;
        this.posts = PostInfo.GetPostsFromDocument(document);
    }

    execute = () => {
        if (!this.userIsModerator) return;

        this.posts.forEach(function (post: PostInfo, key, parent) {
            let cmenu = post.getContextMenu();
            cmenu.addAction("Flytt", true, function () {
                window.location.href = "movet.php?id=" + post.postid;
            });
        }.bind(this));
    }
}